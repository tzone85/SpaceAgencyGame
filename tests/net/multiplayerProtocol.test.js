import {
  createRoomCode,
  createSyncMessage,
  isValidRoomCode,
  parseSocketMessage,
} from "../../src/net/multiplayerProtocol.js";

describe("multiplayer protocol", () => {
  test("creates short readable LAN room codes", () => {
    const code = createRoomCode(() => 0.42);

    expect(code).toHaveLength(5);
    expect(isValidRoomCode(code)).toBe(true);
  });

  test("wraps sync payloads with versioned metadata", () => {
    const message = createSyncMessage({
      roomCode: "AB123",
      playerId: "player-one",
      session: { day: 4 },
    });

    expect(message.type).toBe("session:sync");
    expect(message.version).toBe(1);
    expect(message.roomCode).toBe("AB123");
    expect(message.payload.session.day).toBe(4);
  });

  test("parses only known JSON socket messages", () => {
    expect(parseSocketMessage("not json")).toBeNull();
    expect(parseSocketMessage(JSON.stringify({ type: "wat" }))).toBeNull();

    const parsed = parseSocketMessage(JSON.stringify({
      type: "room:join",
      roomCode: "A1B2C",
      playerId: "p1",
    }));

    expect(parsed.type).toBe("room:join");
  });
});

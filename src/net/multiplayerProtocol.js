const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MESSAGE_TYPES = new Set([
  "room:join",
  "room:leave",
  "room:joined",
  "room:peers",
  "session:sync",
  "player:event",
  "server:error",
]);

export function createRoomCode(rng = Math.random) {
  let code = "";
  for (let index = 0; index < 5; index += 1) {
    code += ROOM_ALPHABET[Math.floor(rng() * ROOM_ALPHABET.length)];
  }
  return code;
}

export function isValidRoomCode(code) {
  return typeof code === "string" && /^[A-Z2-9]{5}$/.test(code.trim().toUpperCase());
}

export function createSyncMessage({ roomCode, playerId, session }) {
  return {
    version: 1,
    type: "session:sync",
    roomCode: roomCode.trim().toUpperCase(),
    playerId,
    sentAt: new Date().toISOString(),
    payload: { session },
  };
}

export function createPlayerEvent({ roomCode, playerId, event }) {
  return {
    version: 1,
    type: "player:event",
    roomCode: roomCode.trim().toUpperCase(),
    playerId,
    sentAt: new Date().toISOString(),
    payload: { event },
  };
}

export function parseSocketMessage(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !MESSAGE_TYPES.has(parsed.type)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export { MESSAGE_TYPES };

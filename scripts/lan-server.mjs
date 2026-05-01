import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { networkInterfaces } from "node:os";
import { WebSocketServer } from "ws";
import { parseSocketMessage } from "../src/net/multiplayerProtocol.js";

const PORT = Number(process.env.PORT || 4174);
const ROOT = resolve("dist");
const INDEX = join(ROOT, "index.html");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

if (!existsSync(INDEX)) {
  console.error("dist/index.html was not found. Run npm run build first.");
  process.exit(1);
}

const rooms = new Map();

function getRoom(code) {
  if (!rooms.has(code)) rooms.set(code, new Map());
  return rooms.get(code);
}

function send(socket, message) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(message));
  }
}

function broadcast(roomCode, message, except = null) {
  const room = getRoom(roomCode);
  for (const peer of room.values()) {
    if (peer.socket !== except) send(peer.socket, message);
  }
}

function broadcastPeers(roomCode) {
  const room = getRoom(roomCode);
  const peers = Array.from(room.values()).map((peer) => ({
    playerId: peer.playerId,
    agencyName: peer.agencyName,
  }));
  broadcast(roomCode, {
    type: "room:peers",
    roomCode,
    payload: { peers },
  });
}

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const filePath = requestPath === "/" ? INDEX : join(ROOT, requestPath);
  const resolved = resolve(filePath);
  const safePath = resolved.startsWith(ROOT) && existsSync(resolved) ? resolved : INDEX;
  const type = MIME_TYPES[extname(safePath)] || "application/octet-stream";

  response.writeHead(200, {
    "content-type": type,
    "cache-control": safePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
  });
  createReadStream(safePath).pipe(response);
});

const wss = new WebSocketServer({ server, path: "/room" });

wss.on("connection", (socket) => {
  let currentRoom = null;
  let currentPlayer = null;

  socket.on("message", (raw) => {
    const message = parseSocketMessage(raw.toString());
    if (!message) {
      send(socket, { type: "server:error", payload: { message: "Invalid message" } });
      return;
    }

    if (message.type === "room:join") {
      currentRoom = message.roomCode;
      currentPlayer = message.playerId;
      const room = getRoom(currentRoom);
      room.set(currentPlayer, {
        socket,
        playerId: currentPlayer,
        agencyName: message.payload?.agencyName || currentPlayer,
      });
      send(socket, { type: "room:joined", roomCode: currentRoom, playerId: currentPlayer });
      broadcastPeers(currentRoom);
      return;
    }

    if (!currentRoom || !currentPlayer) {
      send(socket, { type: "server:error", payload: { message: "Join a room first" } });
      return;
    }

    broadcast(currentRoom, message, socket);
  });

  socket.on("close", () => {
    if (!currentRoom || !currentPlayer) return;
    const room = getRoom(currentRoom);
    room.delete(currentPlayer);
    broadcastPeers(currentRoom);
    if (room.size === 0) rooms.delete(currentRoom);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((details) => details && details.family === "IPv4" && !details.internal)
    .map((details) => `http://${details.address}:${PORT}`);

  console.log(`Stellar Command LAN host running at http://localhost:${PORT}`);
  for (const address of addresses) {
    console.log(`Same-WiFi address: ${address}`);
  }
});

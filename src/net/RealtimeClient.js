import {
  createPlayerEvent,
  createSyncMessage,
  parseSocketMessage,
} from "./multiplayerProtocol.js";

class RealtimeClient extends EventTarget {
  constructor({ url = null } = {}) {
    super();
    this.url = url;
    this.socket = null;
    this.roomCode = null;
    this.playerId = null;
    this.connected = false;
  }

  get defaultUrl() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/room`;
  }

  connect({ roomCode, playerId, agencyName }) {
    this.disconnect();
    this.roomCode = roomCode.trim().toUpperCase();
    this.playerId = playerId;

    this.socket = new WebSocket(this.url || this.defaultUrl);
    this.socket.addEventListener("open", () => {
      this.connected = true;
      this.send({
        type: "room:join",
        roomCode: this.roomCode,
        playerId,
        payload: { agencyName },
      });
      this.emit("status", { status: "connected" });
    });

    this.socket.addEventListener("message", (event) => {
      const message = parseSocketMessage(event.data);
      if (!message) return;
      this.emit(message.type, message);
    });

    this.socket.addEventListener("close", () => {
      this.connected = false;
      this.emit("status", { status: "disconnected" });
    });

    this.socket.addEventListener("error", () => {
      this.emit("status", {
        status: "error",
        message: "LAN room server is not reachable from this page.",
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;
    this.connected = false;
  }

  syncSession(session) {
    if (!this.connected) return;
    this.send(createSyncMessage({
      roomCode: this.roomCode,
      playerId: this.playerId,
      session,
    }));
  }

  sendPlayerEvent(event) {
    if (!this.connected) return;
    this.send(createPlayerEvent({
      roomCode: this.roomCode,
      playerId: this.playerId,
      event,
    }));
  }

  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }

  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export default RealtimeClient;
export { RealtimeClient };

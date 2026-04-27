import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.SOCKET_URL || "http://localhost:3000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected to Socket.io server");
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

export default socket;

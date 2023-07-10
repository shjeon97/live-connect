import { io } from "socket.io-client";

export const socket = io(
  process.env.APP_HOST ? process.env.APP_HOST : "http://localhost:4000",
  {
    transports: ["websocket"],
  }
);

"use client";

import { io, Socket } from "socket.io-client";
import { getSocketBaseUrl } from "./socketBaseUrl";

let socket: Socket | null = null;

export function getGuestStaffSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  const url = getSocketBaseUrl();
  if (!url) return null;

  if (!socket) {
    socket = io(url, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    // ✅ Debugging
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Disconnected:", reason);
    });
  }

  return socket;
}

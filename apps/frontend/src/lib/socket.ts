import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
  const origin = baseURL.startsWith("http")
    ? new URL(baseURL).origin
    : window.location.origin;

  socket = io(origin, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: {
      token: useAuthStore.getState().accessToken,
    },
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

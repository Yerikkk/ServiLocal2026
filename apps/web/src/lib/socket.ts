'use client';

import { io, type Socket } from 'socket.io-client';
import { getApiBaseUrl } from './api-url';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(userId: string): Socket {
  if (!socket) {
    const apiUrl = getApiBaseUrl();
    socket = io(apiUrl, {
      auth: { userId },
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { type Socket } from 'socket.io-client';
import { getSocket, initSocket, disconnectSocket } from '@/lib/socket';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId: string) => void;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = (userId: string) => {
    const newSocket = initSocket(userId);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.emit('join', { userId });
  };

  const disconnect = () => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, connect, disconnect }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

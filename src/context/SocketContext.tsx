import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of the context
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

// Create the context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Create a custom hook for easy access
export const useSocket = () => {
  return useContext(SocketContext);
};

// Create the provider component
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // We initialize the socket connection only once.
    // We connect to our own server, specifying the path.
    const socketInstance = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once

  const value = {
    socket,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
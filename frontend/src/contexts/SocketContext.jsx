import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const token = localStorage.getItem('cc_token');
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    newSocket.on('connect', () => {
      // Connected to socket gateway
    });

    newSocket.on('notification:new', (notification) => {
      setUnreadCount((prev) => prev + 1);
      addToast(notification.title, 'info');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinClub = (clubId) => {
    if (socket && clubId) {
      socket.emit('join:club', clubId);
    }
  };

  const leaveClub = (clubId) => {
    if (socket && clubId) {
      socket.emit('leave:club', clubId);
    }
  };

  const joinEvent = (eventId) => {
    if (socket && eventId) {
      socket.emit('join:event', eventId);
    }
  };

  const leaveEvent = (eventId) => {
    if (socket && eventId) {
      socket.emit('leave:event', eventId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadCount,
        setUnreadCount,
        joinClub,
        leaveClub,
        joinEvent,
        leaveEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || {};
};

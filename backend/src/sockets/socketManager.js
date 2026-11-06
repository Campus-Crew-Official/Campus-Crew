import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || (ENV.CLIENT_URL && origin === ENV.CLIENT_URL)) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed for Socket.IO'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Handshake authentication
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;

    // Check cookie in handshake headers
    if (!token && socket.handshake.headers?.cookie) {
      const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      // Allow connection but as guest; authenticated rooms won't be joined
      return next();
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.userId) {
      // Auto-join user's personal channel
      const userRoom = `user:${socket.user.userId}`;
      socket.join(userRoom);
    }

    // Join club room
    socket.on('join:club', (clubId) => {
      if (clubId) {
        socket.join(`club:${clubId}`);
      }
    });

    // Leave club room
    socket.on('leave:club', (clubId) => {
      if (clubId) {
        socket.leave(`club:${clubId}`);
      }
    });

    // Join event room
    socket.on('join:event', (eventId) => {
      if (eventId) {
        socket.join(`event:${eventId}`);
      }
    });

    // Leave event room
    socket.on('leave:event', (eventId) => {
      if (eventId) {
        socket.leave(`event:${eventId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitToUser = (userId, eventName, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(eventName, data);
  }
};

export const emitToClub = (clubId, eventName, data) => {
  if (io && clubId) {
    io.to(`club:${clubId}`).emit(eventName, data);
  }
};

export const emitToEvent = (eventId, eventName, data) => {
  if (io && eventId) {
    io.to(`event:${eventId}`).emit(eventName, data);
  }
};

export const broadcastNotification = (notification) => {
  if (io && notification?.userId) {
    io.to(`user:${notification.userId}`).emit('notification:new', notification);
  }
};

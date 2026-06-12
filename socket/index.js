const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const socketHandlers = require('./socketHandlers');

const { setIo } = require('../utils/notificationService');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"]
    }
  });

  setIo(io); // Added

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Global debug listener for all events
    socket.onAny((event, ...args) => {
        console.log(`[GLOBAL SOCKET DEBUG] User ${socket.user?.id || 'Unknown'} sent event: ${event}`, args);
    });
    
    socketHandlers(io, socket);
  });

  return io;
};

module.exports = initSocket;

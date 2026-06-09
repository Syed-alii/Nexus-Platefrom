const Meeting = require('../models/Meeting');
const Message = require('../models/Message');

const socketHandlers = (io, socket) => {
  console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

  socket.onAny((event, ...args) => {
    console.log(`[SOCKET DEBUG] Received event: ${event}`, args);
  });

  // Join private user room for notifications and messages
  const userId = socket.user.id.toString();
  socket.join(userId);
  console.log(`[SOCKET] User joined private room: ${userId}`);

  // Send Message
  socket.on('send-message', async ({ receiverId, content }) => {
    try {
      const senderId = socket.user.id.toString();
      const rId = receiverId.toString();

      console.log(`[SOCKET] Send message: ${senderId} -> ${rId}`);

      const message = await Message.create({
        senderId,
        receiverId: rId,
        content,
      });

      // Emit to receiver's private room
      io.to(rId).emit('receive-message', message);
      // Emit to sender's private room (for UI update)
      socket.emit('receive-message', message);
      console.log(`[SOCKET] Message emitted to rooms: ${rId}, ${senderId}`);
    } catch (error) {
      console.error('Socket send-message error:', error);
    }
  });

  socket.on('join-room', async (roomId) => {
    try {
      console.log(`[JOIN REQUEST] User: ${socket.user.id}, Socket: ${socket.id}, Room: ${roomId}`);

      // 1. Verify Meeting exists and is accepted
      const meeting = await Meeting.findById(roomId);
      
      if (!meeting) {
        return socket.emit('room-error', { message: 'Meeting not found' });
      }

      if (meeting.status !== 'accepted') {
        return socket.emit('room-error', { message: 'Meeting must be accepted to join the call' });
      }

      // 2. Verify User belongs to meeting
      const isOrganizer = meeting.organizer.toString() === socket.user.id;
      const isParticipant = meeting.participant.toString() === socket.user.id;

      if (!isOrganizer && !isParticipant) {
        return socket.emit('room-error', { message: 'You are not authorized to join this call' });
      }

      // 3. Verify Room Capacity (Max 2 users)
      const room = io.sockets.adapter.rooms.get(roomId);
      const numClients = room ? room.size : 0;
      console.log(`[ROOM SIZE BEFORE] Room: ${roomId}, Size: ${numClients}`);

      // NEW: Prevent re-joining if already in the room
      if (socket.rooms.has(roomId)) {
        console.log(`[DEBUG] User ${socket.user.id} already in room ${roomId}. Skipping.`);
        return;
      }

      if (numClients >= 2) {
        console.log(`[ROOM FULL] User: ${socket.user.id}, Socket: ${socket.id}, Room: ${roomId}, Size: ${numClients}`);
        return socket.emit('room-full', { roomId });
      }

      // 4. Join the room
      socket.join(roomId);
      
      const roomAfter = io.sockets.adapter.rooms.get(roomId);
      const numClientsAfter = roomAfter ? roomAfter.size : 0;
      console.log(`[ROOM SIZE AFTER] Room: ${roomId}, Size: ${numClientsAfter}`);
      
      // Log all sockets in the room
      if (roomAfter) {
          console.log(`[DEBUG] Sockets in room ${roomId}:`, Array.from(roomAfter));
      }
      
      console.log(`[JOIN SUCCESS] User ${socket.user.id} joined room ${roomId}`);

      // Notify others in the room
      console.log(`[DEBUG] Broadcasting 'user-joined' to room ${roomId}`);
      socket.to(roomId).emit('user-joined', { 
        userId: socket.user.id,
        socketId: socket.id 
      });

      // Broadcast updated room size to everyone in the room
      const roomUpdate = io.sockets.adapter.rooms.get(roomId);
      io.to(roomId).emit('room-update', { count: roomUpdate ? roomUpdate.size : 0 });

    } catch (error) {
      console.error('Socket join-room error:', error);
      socket.emit('room-error', { message: 'Server error during room joining' });
    }
  });

  // Signaling: Offer
  socket.on('offer', ({ roomId, offer }) => {
    console.log(`Offer received from ${socket.id} for room ${roomId}`);
    socket.to(roomId).emit('offer', { offer, from: socket.id });
  });

  // Signaling: Answer
  socket.on('answer', ({ roomId, answer }) => {
    console.log(`Answer received from ${socket.id} for room ${roomId}`);
    socket.to(roomId).emit('answer', { answer, from: socket.id });
  });

  // Signaling: ICE Candidate
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log(`[DEBUG] Received ICE candidate from ${socket.id} for room ${roomId}. Relaying...`);
    socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
  });

  // Leave Room
  const leaveRoom = (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.user.id} left room ${roomId}`);
    socket.to(roomId).emit('user-left', { userId: socket.user.id });
    
    // Broadcast updated room size
    const room = io.sockets.adapter.rooms.get(roomId);
    io.to(roomId).emit('room-update', { count: room ? room.size : 0 });
  };

  socket.on('leave-room', (roomId) => {
    leaveRoom(roomId);
  });

  socket.on('disconnecting', () => {
    // Notify all rooms the user was in before they are removed
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit('user-left', { userId: socket.user.id });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};

module.exports = socketHandlers;

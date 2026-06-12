const Notification = require('../models/Notification');

let io;

const setIo = (socketIo) => {
  io = socketIo;
};

const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    if (io) {
      // Emit to the specific user's room (we should make users join their own ID room on connection)
      io.to(data.recipient.toString()).emit('new-notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  setIo,
  createNotification,
};

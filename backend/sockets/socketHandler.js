const { v4: uuidv4 } = require('uuid');

// In-memory state for rooms
// { roomId: { users: [{socketId, username}], code: '', language: 'javascript' } }
const rooms = {};

const initializeSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, username }) => {
      // Create room if it doesn't exist
      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: [],
          code: '// Start coding here...\n',
          language: 'javascript',
          whiteboard: []
        };
      }

      // Check user limit
      if (rooms[roomId].users.length >= 10) {
        socket.emit('room-full');
        return;
      }

      const user = { socketId: socket.id, username };
      rooms[roomId].users.push(user);
      socket.join(roomId);

      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        message: `${username} joined the room`,
        users: rooms[roomId].users
      });

      // Send current state to newly joined user
      socket.emit('room-state', {
        code: rooms[roomId].code,
        language: rooms[roomId].language,
        users: rooms[roomId].users,
        whiteboard: rooms[roomId].whiteboard || []
      });

      console.log(`${username} joined room ${roomId}`);
    });

    // Code synchronize
    socket.on('code-update', ({ roomId, code }) => {
      if (rooms[roomId]) {
        rooms[roomId].code = code;
        socket.to(roomId).emit('code-change', code);
      }
    });

    // Language synchronize
    socket.on('language-update', ({ roomId, language }) => {
      if (rooms[roomId]) {
        rooms[roomId].language = language;
        socket.to(roomId).emit('language-change', language);
      }
    });

    // Cursor tracking
    socket.on('cursor-update', ({ roomId, cursor, username }) => {
      // Broadcast cursor updates
      socket.to(roomId).emit('remote-cursor-update', {
        socketId: socket.id,
        cursor,
        username
      });
    });

    // Chat system
    socket.on('chat-message', ({ roomId, message, username }) => {
      socket.to(roomId).emit('receive-message', {
        id: uuidv4(),
        text: message,
        username,
        timestamp: new Date().toISOString()
      });
    });

    // Whiteboard synchronization
    socket.on('whiteboard-update', ({ roomId, elements }) => {
      if (rooms[roomId]) {
        rooms[roomId].whiteboard = elements;
        socket.to(roomId).emit('whiteboard-update', elements);
      }
    });

    socket.on('whiteboard-clear', ({ roomId }) => {
      if (rooms[roomId]) {
        rooms[roomId].whiteboard = [];
        socket.to(roomId).emit('whiteboard-clear');
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Find room user was in
      let foundRoomId = null;
      let leftUsername = null;

      for (const [roomId, room] of Object.entries(rooms)) {
        const userIndex = room.users.findIndex(u => u.socketId === socket.id);
        if (userIndex !== -1) {
          leftUsername = room.users[userIndex].username;
          room.users.splice(userIndex, 1);
          foundRoomId = roomId;

          // If room gets empty, clean it up optionally, but let's keep it in memory
          if (room.users.length === 0) {
            delete rooms[roomId];
          }
          break;
        }
      }

      if (foundRoomId && leftUsername) {
        socket.to(foundRoomId).emit('user-left', {
          message: `${leftUsername} left the room`,
          users: rooms[foundRoomId] ? rooms[foundRoomId].users : []
        });
      }
    });
  });
};

module.exports = initializeSockets;

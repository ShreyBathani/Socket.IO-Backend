// Chat Rooms Example - Backend Logic
const ROOMS = ['News', 'Entertainment'];

const chatRoomsHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('💬 Chat Rooms: User connected:', socket.id);
    
    // Send available rooms list on connection
    socket.emit('roomsList', ROOMS);
    
    // Handle request for rooms list (for navigation without refresh)
    socket.on('getRoomsList', () => {
      console.log('📋 Rooms list requested by:', socket.id);
      socket.emit('roomsList', ROOMS);
    });
    
    // Handle room join
    socket.on('joinRoom', (room) => {
      if (ROOMS.includes(room)) {
        // Leave all previous rooms
        socket.rooms.forEach(r => {
          if (r !== socket.id) {
            socket.leave(r);
          }
        });
        
        // Join new room
        socket.join(room);
        console.log(`✅ ${socket.id} joined room: ${room}`);
        
        // Notify user they joined
        socket.emit('roomJoined', room);
        
        // Notify others in the room
        socket.to(room).emit('userJoined', {
          message: `User ${socket.id.slice(0, 5)} joined ${room}`,
          room: room
        });
      }
    });
    
    // Handle chat message
    socket.on('sendMessage', ({ room, message, username }) => {
      if (ROOMS.includes(room)) {
        const messageData = {
          id: Date.now(),
          username: username || socket.id.slice(0, 5),
          message: message,
          room: room,
          timestamp: new Date().toLocaleTimeString()
        };
        
        console.log(`📨 Message in ${room}:`, messageData.message);
        
        // Send to everyone in the room (including sender)
        io.to(room).emit('newMessage', messageData);
      }
    });
    
    // Handle leave room
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(`❌ ${socket.id} left room: ${room}`);
      
      socket.to(room).emit('userLeft', {
        message: `User ${socket.id.slice(0, 5)} left ${room}`,
        room: room
      });
      
      socket.emit('roomLeft', room);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('💬 Chat Rooms: User disconnected:', socket.id);
    });
  });
};

module.exports = { chatRoomsHandler };

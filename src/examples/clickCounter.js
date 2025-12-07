// Click Counter Example - Backend Logic
let count = 0;

const clickCounterHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔢 Click Counter: User connected');
    
    // Send current count when user connects
    socket.emit('update', count);
    
    // Handle request for current count
    socket.on('getCount', () => {
      socket.emit('update', count);
    });
    
    // Listen for click events
    socket.on('click', () => {
      count++;
      console.log(`👆 Click received! New count: ${count}`);
      // Broadcast new count to ALL connected users
      io.emit('update', count);
    });
  });
};

module.exports = { clickCounterHandler };

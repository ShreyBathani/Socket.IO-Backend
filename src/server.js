const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import examples
const { clickCounterHandler } = require('./examples/clickCounter');
const { chatRoomsHandler } = require('./examples/chatRooms');
const { salesDashboardHandler } = require('./examples/salesDashboard');

const app = express();
const httpServer = createServer(app);

// Dynamic CORS configuration based on environment
const getAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_URL_LOCAL || 'http://localhost:3000',
    process.env.CLIENT_URL_PRODUCTION,
  ].filter(Boolean); // Remove undefined values

  console.log('✅ Allowed CORS Origins:', origins);
  return origins;
};

const io = new Server(httpServer, { // initialize Socket.IO server with existing HTTP server
  cors: { // CORS settings
    origin: getAllowedOrigins(), // allow only specific domains returned by this function
    methods: ["GET", "POST"], // allow only GET and POST requests during handshake
    credentials: true // allow cookies / auth headers in cross-origin requests
  },
  transports: ['websocket', 'polling'], // allowed transports: websocket first, fallback to polling
  allowEIO3: true, // allow older Socket.IO v2 (Engine.IO v3) clients to connect
  pingTimeout: 60000, // disconnect client if no pong within 60 seconds
  pingInterval: 25000 // send ping to client every 25 seconds to check connection
});

// Express CORS configuration
app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true
}));

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.IO Backend Running',
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: getAllowedOrigins()
  });
});

// Initialize Examples
clickCounterHandler(io);
chatRoomsHandler(io);
salesDashboardHandler(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS enabled for: ${getAllowedOrigins().join(', ')}`);
});

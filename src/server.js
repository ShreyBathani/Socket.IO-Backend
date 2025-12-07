const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import examples
const { clickCounterHandler } = require('./examples/clickCounter');
const { chatRoomsHandler } = require('./examples/chatRooms');

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

const io = new Server(httpServer, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true
  }
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

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS enabled for: ${getAllowedOrigins().join(', ')}`);
});

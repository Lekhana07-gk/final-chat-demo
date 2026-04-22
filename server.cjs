const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows your React app to talk to this server

const server = http.createServer(app);

// Setup Socket.io and allow connections from your React Vite port (5173/5174/etc)
const io = new Server(server, {
  cors: {
    origin: "*", // For development, allow any origin
    methods: ["GET", "POST"]
  }
});

// This listens for users connecting
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for a custom 'send_message' event from the React frontend
  socket.on('send_message', (data) => {
    console.log("Message received on server:", data);
    
    // Broadcast that exact message out to EVERYONE else who is connected
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Real-time server running on http://localhost:${PORT}`);
});
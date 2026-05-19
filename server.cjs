const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data);
  });

  // New delete event
  socket.on('delete_for_all', (messageId) => {
    socket.broadcast.emit('message_deleted_for_all', messageId);
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
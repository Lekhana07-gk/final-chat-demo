const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file/media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Socket.io Setup with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_connection_string_here";
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Message Schema & Model
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  type: { type: String, default: 'text' },
  fileUrl: String,
  timestamp: { type: String, default: () => new Date().toLocaleTimeString() }
});
const Message = mongoose.model('Message', messageSchema);

// REST Endpoint to fetch message history
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ _id: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// REST Endpoint for file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// Socket.io Real-Time Connection Handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('delete_message_everyone', (data) => {
    socket.broadcast.emit('message_deleted', data);
  });

  socket.on('send_message', async (data) => {
    try {
      // Save message to MongoDB
      const newMessage = new Message({
        sender: data.sender || 'Anonymous',
        text: data.text || '',
        type: data.type || 'text',
        fileUrl: data.fileUrl || '',
        timestamp: data.timestamp || new Date().toLocaleTimeString()
      });
      await newMessage.save();

      // Broadcast message to all other connected clients
      socket.broadcast.emit('receive_message', newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
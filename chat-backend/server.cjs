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
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// FIX: Schema set to strict: false so it doesn't strip time, id, or senderName
const messageSchema = new mongoose.Schema({
  id: Number,
  senderName: String,
  time: String,
  text: String,
  type: { type: String, default: 'text' },
  fileUrl: String
}, { strict: false }); 
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

  socket.on('send_message', async (data) => {
    try {
      // FIX: Broadcast EXACTLY what the frontend sent (keeps name, time, and ID intact)
      socket.broadcast.emit('receive_message', data);

      // Save message to MongoDB
      const newMessage = new Message(data);
      await newMessage.save();
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // FIX: Make "Delete for Everyone" work across all tabs and delete from database
  socket.on('delete_message_everyone', async (data) => {
    try {
      // Broadcast delete command to other users
      socket.broadcast.emit('message_deleted', data);
      
      // Permanently remove from database
      await Message.deleteOne({ id: data.msgId });
    } catch (err) {
      console.error("Error deleting message:", err);
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
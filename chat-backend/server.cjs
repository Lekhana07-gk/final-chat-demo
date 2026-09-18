const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');

// Import your Database Model
const Message = require('./models/Message.js');


// 2. Connect to MongoDB for permanent storage
mongoose.connect(process.env.mongodb+srv://lekhanar183_db_user:<Lekhana123>@cluster0.jczmxtn.mongodb.net/?appName=Cluster0)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. Configure file uploads with a strict 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 4. Initialize Express and Middleware
const app = express();
app.use(cors());
app.use(express.json()); // Allows Express to understand JSON data

// 5. Create the HTTP and WebSocket Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allows your React frontend to connect
    methods: ["GET", "POST"]
  }
});

// 6. Handle WebSocket (Real-time) Connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user sends a new message
  socket.on('send_message', async (data) => {
    console.log("Message received on server:", data.text);
    
    try {
      // Save the message permanently to MongoDB
      await Message.create(data);
      
      // Broadcast that exact message out to EVERYONE else
      socket.broadcast.emit('receive_message', data);
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  });

  // When a user deletes a message
  socket.on('delete_message', async ({ msgId, deleteType, username }) => {
    try {
      if (deleteType === 'everyone') {
        // Mark as deleted for everyone in MongoDB
        await Message.findOneAndUpdate({ id: msgId }, { isDeletedForEveryone: true });
        
        // Tell EVERYONE connected to update their screen
        io.emit('message_deleted', { msgId, type: 'everyone' });
      } 
      else if (deleteType === 'me') {
        // Add this user to the hidden list in MongoDB
        await Message.findOneAndUpdate({ id: msgId }, { $push: { deletedBy: username } });
        
        // Tell ONLY this specific user to update their screen
        socket.emit('message_deleted', { msgId, type: 'me', username });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 7. Express API Routes

// Route to load old messages when a user logs in
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Route to handle 10MB file sharing
app.post('/api/upload', upload.single('mediaFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  // The file is temporarily stored in memory (req.file.buffer)
  console.log(`File received: ${req.file.originalname} (${req.file.size} bytes)`);
  
  // Next Step: Add cloud upload logic (e.g., AWS S3 or Cloudinary) here 
  // and send the generated URL back to the frontend to save in the chat.
  
  res.json({ message: "File received successfully", fileDetails: req.file });
});

// 8. Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Real-time server running on http://localhost:${PORT}`);
});
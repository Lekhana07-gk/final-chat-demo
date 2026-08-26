import express from 'express';
import mongoose from 'mongoose';
import dns from 'node:dns';
// Make sure to import your Message model!
import Message from './models/Message.js'; 

// 1. Set DNS bypass
dns.setServers(['8.8.8.8', '8.8.4.4']);

// 2. Initialize Express
const app = express();

// 3. Define your routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to load chat history" });
  }
});

// We are putting the URL directly here to bypass the .env file!
const dbURL = "mongodb+srv://lekhanar183_db_user:SkkZWxdZdprl3Atg@cluster0.jczmxtn.mongodb.net/chatApp?retryWrites=true&w=majority";

mongoose.connect(dbURL)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
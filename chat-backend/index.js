import dns from 'node:dns';
//Force Node.js to use Google's DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import mongoose from 'mongoose';

const app = express();

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
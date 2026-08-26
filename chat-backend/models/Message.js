import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // Can be changed to ObjectId if you create a User model later
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    }
  },
  { timestamps: true } // Automatically creates 'createdAt' and 'updatedAt' fields
);

export default mongoose.model('Message', messageSchema);
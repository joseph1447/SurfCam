import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  reactions: [{
    emoji: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

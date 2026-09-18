import mongoose from 'mongoose';

const aiChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  // Song suggestions attached to an assistant reply, or the song the user
  // attached to their own message. Stored loosely so provider shape changes
  // do not break historic messages.
  songs: {
    type: Array,
    default: []
  },
  attachedSong: {
    type: Object,
    default: null
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  clientId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

aiChatMessageSchema.index({ userId: 1, createdAt: 1 });

export const AiChatMessage = mongoose.model('AiChatMessage', aiChatMessageSchema);

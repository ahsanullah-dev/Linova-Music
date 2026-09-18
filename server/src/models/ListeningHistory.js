import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    default: 'mock'
  },
  trackId: {
    type: String,
    required: true
  },
  track: {
    id: String,
    title: String,
    artist: String,
    artists: Array,
    album: Object,
    artwork: String,
    duration: Number,
    audioUrl: String,
    canDownload: Boolean
  },
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completionPercentage: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

listeningHistorySchema.index({ userId: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model('ListeningHistory', listeningHistorySchema);

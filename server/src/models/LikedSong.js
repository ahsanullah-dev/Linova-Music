import mongoose from 'mongoose';

const likedSongSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

likedSongSchema.index({ userId: 1, provider: 1, trackId: 1 }, { unique: true });

export const LikedSong = mongoose.model('LikedSong', likedSongSchema);

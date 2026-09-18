import mongoose from 'mongoose';

const trackSnapshotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  provider: { type: String, default: 'mock' },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  artists: [{ id: String, name: String }],
  album: { id: String, name: String },
  artwork: { type: String },
  duration: { type: Number, default: 0 },
  audioUrl: { type: String },
  canDownload: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a playlist name'],
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    default: '',
    maxLength: 300
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tracks: [trackSnapshotSchema]
}, {
  timestamps: true
});

export const Playlist = mongoose.model('Playlist', playlistSchema);

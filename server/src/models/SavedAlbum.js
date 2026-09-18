import mongoose from 'mongoose';

const savedAlbumSchema = new mongoose.Schema({
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
  albumId: {
    type: String,
    required: true
  },
  album: {
    id: String,
    title: String,
    artist: String,
    artwork: String,
    year: Number,
    trackCount: Number
  }
}, {
  timestamps: true
});

savedAlbumSchema.index({ userId: 1, provider: 1, albumId: 1 }, { unique: true });

export const SavedAlbum = mongoose.model('SavedAlbum', savedAlbumSchema);

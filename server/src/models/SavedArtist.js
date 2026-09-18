import mongoose from 'mongoose';

const savedArtistSchema = new mongoose.Schema({
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
  artistId: {
    type: String,
    required: true
  },
  artist: {
    id: String,
    name: String,
    avatar: String,
    genres: [String],
    monthlyListeners: String
  }
}, {
  timestamps: true
});

savedArtistSchema.index({ userId: 1, provider: 1, artistId: 1 }, { unique: true });

export const SavedArtist = mongoose.model('SavedArtist', savedArtistSchema);

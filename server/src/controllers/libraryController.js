import { LikedSong } from '../models/LikedSong.js';
import { SavedAlbum } from '../models/SavedAlbum.js';
import { SavedArtist } from '../models/SavedArtist.js';
import { getDBStatus } from '../config/db.js';
import { mockStore } from '../models/mockStore.js';

export const getLikedSongs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode) {
      const likes = await mockStore.getLikedSongs(userId);
      return res.json({ success: true, data: likes });
    }

    const likes = await LikedSong.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: likes });
  } catch (error) {
    next(error);
  }
};

export const addLikedSong = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { track } = req.body;

    if (!track || !track.id) {
      return res.status(400).json({ success: false, error: { message: 'Track payload required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const item = await mockStore.addLikedSong(userId, track);
      return res.status(201).json({ success: true, data: item });
    }

    const existing = await LikedSong.findOne({ userId, trackId: track.id });
    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const item = await LikedSong.create({
      userId,
      provider: track.provider || 'mock',
      trackId: track.id,
      track
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const removeLikedSong = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { trackId } = req.params;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      await mockStore.removeLikedSong(userId, trackId);
      return res.json({ success: true, message: 'Song removed from liked collection' });
    }

    await LikedSong.findOneAndDelete({ userId, trackId });
    res.json({ success: true, message: 'Song removed from liked collection' });
  } catch (error) {
    next(error);
  }
};

export const getSavedAlbums = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode) {
      const albums = await mockStore.getSavedAlbums(userId);
      return res.json({ success: true, data: albums });
    }

    const albums = await SavedAlbum.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: albums });
  } catch (error) {
    next(error);
  }
};

export const addSavedAlbum = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { album } = req.body;

    if (!album || !album.id) {
      return res.status(400).json({ success: false, error: { message: 'Album payload required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const item = await mockStore.addSavedAlbum(userId, album);
      return res.status(201).json({ success: true, data: item });
    }

    const item = await SavedAlbum.findOneAndUpdate(
      { userId, albumId: album.id },
      { userId, provider: album.provider || 'mock', albumId: album.id, album },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const removeSavedAlbum = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { albumId } = req.params;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      await mockStore.removeSavedAlbum(userId, albumId);
      return res.json({ success: true, message: 'Album removed from library' });
    }

    await SavedAlbum.findOneAndDelete({ userId, albumId });
    res.json({ success: true, message: 'Album removed from library' });
  } catch (error) {
    next(error);
  }
};

export const getSavedArtists = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode) {
      const artists = await mockStore.getSavedArtists(userId);
      return res.json({ success: true, data: artists });
    }

    const artists = await SavedArtist.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: artists });
  } catch (error) {
    next(error);
  }
};

export const addSavedArtist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { artist } = req.body;

    if (!artist || !artist.id) {
      return res.status(400).json({ success: false, error: { message: 'Artist payload required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const item = await mockStore.addSavedArtist(userId, artist);
      return res.status(201).json({ success: true, data: item });
    }

    const item = await SavedArtist.findOneAndUpdate(
      { userId, artistId: artist.id },
      { userId, provider: artist.provider || 'mock', artistId: artist.id, artist },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const removeSavedArtist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { artistId } = req.params;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      await mockStore.removeSavedArtist(userId, artistId);
      return res.json({ success: true, message: 'Artist removed from library' });
    }

    await SavedArtist.findOneAndDelete({ userId, artistId });
    res.json({ success: true, message: 'Artist removed from library' });
  } catch (error) {
    next(error);
  }
};

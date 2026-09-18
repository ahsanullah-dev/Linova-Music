import { Playlist } from '../models/Playlist.js';
import { getDBStatus } from '../config/db.js';
import { mockStore } from '../models/mockStore.js';

export const getPlaylists = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode) {
      const playlists = await mockStore.getUserPlaylists(userId);
      return res.json({ success: true, data: playlists });
    }

    const playlists = await Playlist.find({ userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, coverImage } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: { message: 'Playlist name is required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const playlist = await mockStore.createPlaylist(userId, { name, description, coverImage });
      return res.status(201).json({ success: true, data: playlist });
    }

    const playlist = await Playlist.create({
      userId,
      name,
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode) {
      const playlist = await mockStore.getPlaylistById(id);
      if (!playlist) {
        return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
      }
      return res.json({ success: true, data: playlist });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, description, coverImage, isPublic } = req.body;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const updated = await mockStore.updatePlaylist(id, userId, {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(coverImage && { coverImage }),
        ...(isPublic !== undefined && { isPublic })
      });
      if (!updated) return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
      return res.json({ success: true, data: updated });
    }

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ success: false, error: { message: 'Playlist not found or unauthorized' } });
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (coverImage) playlist.coverImage = coverImage;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const deleted = await mockStore.deletePlaylist(id, userId);
      if (!deleted) return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
      return res.json({ success: true, message: 'Playlist deleted' });
    }

    const playlist = await Playlist.findOneAndDelete({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ success: false, error: { message: 'Playlist not found or unauthorized' } });
    }

    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    next(error);
  }
};

export const addTrackToPlaylist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { track } = req.body;

    if (!track || !track.id) {
      return res.status(400).json({ success: false, error: { message: 'Track object is required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const updated = await mockStore.addTrackToPlaylist(id, userId, track);
      if (!updated) return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
      return res.json({ success: true, data: updated });
    }

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ success: false, error: { message: 'Playlist not found or unauthorized' } });
    }

    const alreadyExists = playlist.tracks.some(t => t.id === track.id);
    if (!alreadyExists) {
      playlist.tracks.push({
        id: track.id,
        provider: track.provider || 'mock',
        title: track.title,
        artist: track.artist,
        artists: track.artists || [],
        album: track.album || {},
        artwork: track.artwork,
        duration: track.duration || 0,
        audioUrl: track.audioUrl,
        canDownload: track.canDownload !== false,
        addedAt: new Date()
      });
      await playlist.save();
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const removeTrackFromPlaylist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, trackId } = req.params;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const updated = await mockStore.removeTrackFromPlaylist(id, userId, trackId);
      if (!updated) return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
      return res.json({ success: true, data: updated });
    }

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ success: false, error: { message: 'Playlist not found or unauthorized' } });
    }

    playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
    await playlist.save();

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const reorderPlaylistTracks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { sourceIndex, destinationIndex } = req.body;

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const updated = await mockStore.reorderPlaylistTracks(id, userId, sourceIndex, destinationIndex);
      if (!updated) return res.status(404).json({ success: false, error: { message: 'Playlist not found' } });
      return res.json({ success: true, data: updated });
    }

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ success: false, error: { message: 'Playlist not found or unauthorized' } });
    }

    const [movedTrack] = playlist.tracks.splice(sourceIndex, 1);
    playlist.tracks.splice(destinationIndex, 0, movedTrack);
    await playlist.save();

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

import { ListeningHistory } from '../models/ListeningHistory.js';
import { getDBStatus } from '../config/db.js';
import { mockStore } from '../models/mockStore.js';

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'guest_session';
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode) {
      const history = await mockStore.getHistory(userId);
      return res.json({ success: true, data: history });
    }

    const history = await ListeningHistory.find({ userId }).sort({ playedAt: -1 }).limit(50);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const addHistory = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'guest_session';
    const { track, completionPercentage } = req.body;

    if (!track || !track.id) {
      return res.status(400).json({ success: false, error: { message: 'Track object is required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode) {
      const record = await mockStore.addHistory(userId, track, completionPercentage || 100);
      return res.status(201).json({ success: true, data: record });
    }

    const record = await ListeningHistory.create({
      userId,
      provider: track.provider || 'youtube-music',
      trackId: track.id,
      track,
      completionPercentage: completionPercentage || 100
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const getSearches = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'guest_session';
    const searches = await mockStore.getSearches(userId);
    res.json({ success: true, data: searches });
  } catch (error) {
    next(error);
  }
};

export const recordSearch = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'guest_session';
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Query is required' } });
    }
    const item = await mockStore.addSearch(userId, query);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

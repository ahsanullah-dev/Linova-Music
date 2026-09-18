import { ListeningHistory } from '../models/ListeningHistory.js';
import { getDBStatus } from '../config/db.js';
import { mockStore } from '../models/mockStore.js';

/**
 * Guests have no ObjectId. Previously every guest request passed the literal
 * string 'guest_session' into a Mongoose ObjectId field, which threw a
 * CastError on every single call and surfaced to the client as a 404.
 * Guests are now served from the in-memory mock store only.
 */
const getRealUserId = (req) => (req.user ? req.user._id : null);

export const getHistory = async (req, res, next) => {
  try {
    const userId = getRealUserId(req);
    const dbStatus = getDBStatus();

    if (dbStatus.isMockMode || !userId) {
      const history = await mockStore.getHistory(userId || 'guest_session');
      return res.json({ success: true, data: history });
    }

    const history = await ListeningHistory.find({ userId })
      .sort({ playedAt: -1 })
      .limit(50);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const addHistory = async (req, res, next) => {
  try {
    const userId = getRealUserId(req);
    const { track, completionPercentage } = req.body;

    if (!track || !track.id) {
      return res.status(400).json({ success: false, error: { message: 'Track object is required' } });
    }

    const dbStatus = getDBStatus();
    if (dbStatus.isMockMode || !userId) {
      const record = await mockStore.addHistory(userId || 'guest_session', track, completionPercentage || 100);
      return res.status(201).json({ success: true, data: record });
    }

    // Collapse repeat plays of the same track within a short window so the
    // taste profile is not dominated by a single song on repeat.
    const recent = await ListeningHistory.findOne({ userId, trackId: track.id })
      .sort({ playedAt: -1 })
      .select('playedAt');

    if (recent && Date.now() - new Date(recent.playedAt).getTime() < 60 * 1000) {
      return res.status(200).json({ success: true, data: recent });
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
    const userId = getRealUserId(req);
    const searches = await mockStore.getSearches(userId || 'guest_session');
    res.json({ success: true, data: searches });
  } catch (error) {
    next(error);
  }
};

export const recordSearch = async (req, res, next) => {
  try {
    const userId = getRealUserId(req);
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Query is required' } });
    }
    const item = await mockStore.addSearch(userId || 'guest_session', query);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

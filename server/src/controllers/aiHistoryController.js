import { AiChatMessage } from '../models/AiChatMessage.js';
import { getDBStatus } from '../config/db.js';
import { mockStore } from '../models/mockStore.js';

const MAX_RETURNED = 200;

/**
 * AI chat is a logged-in-only feature, so req.user is always present here
 * (routes are wrapped in `protect`).
 */
export const getAiHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus().isMockMode) {
      const messages = await mockStore.getAiMessages(userId);
      return res.json({ success: true, data: messages });
    }

    const messages = await AiChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(MAX_RETURNED);

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const addAiMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { role, content, songs, attachedSong, hasImage, clientId } = req.body;

    if (!role || !['user', 'assistant'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: "role must be 'user' or 'assistant'" }
      });
    }

    const payload = {
      userId,
      role,
      content: content || '',
      songs: Array.isArray(songs) ? songs : [],
      attachedSong: attachedSong || null,
      hasImage: !!hasImage,
      clientId: clientId || null
    };

    if (getDBStatus().isMockMode) {
      const saved = await mockStore.addAiMessage(userId, payload);
      return res.status(201).json({ success: true, data: saved });
    }

    const saved = await AiChatMessage.create(payload);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicit user-initiated clear. Chat history is never removed automatically.
 */
export const clearAiHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus().isMockMode) {
      await mockStore.clearAiMessages(userId);
      return res.json({ success: true, data: { cleared: true } });
    }

    await AiChatMessage.deleteMany({ userId });
    res.json({ success: true, data: { cleared: true } });
  } catch (error) {
    next(error);
  }
};

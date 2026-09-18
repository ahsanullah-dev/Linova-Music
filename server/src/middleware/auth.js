import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { mockStore } from '../models/mockStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required to access this resource.' }
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const dbStatus = getDBStatus();

    let user;
    if (dbStatus.isMockMode) {
      user = await mockStore.findUserById(decoded.id);
    } else {
      user = await User.findById(decoded.id).select('-passwordHash');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User session no longer valid.' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or has expired.' }
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      const dbStatus = getDBStatus();
      if (dbStatus.isMockMode) {
        req.user = await mockStore.findUserById(decoded.id);
      } else {
        req.user = await User.findById(decoded.id).select('-passwordHash');
      }
    } catch (e) {
      // Ignore token failure for optional auth
    }
  }
  next();
};

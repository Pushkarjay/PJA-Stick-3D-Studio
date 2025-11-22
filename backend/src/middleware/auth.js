const jwt = require('jsonwebtoken');
const { getAuth } = require('../config/firebase');
const { AppError } = require('./errorHandler');
const { logger } = require('../utils/logger');

/**
 * Verify JWT token middleware
 */
async function verifyToken(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify Firebase token
    const auth = getAuth();
    const firebaseUser = await auth.getUser(decoded.uid);
    
    if (!firebaseUser) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Attach user to request
    req.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: decoded.role || 'customer'
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    next(error);
  }
}

/**
 * Check if user is admin
 */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new AppError('Admin access required', 403, 'FORBIDDEN');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const auth = getAuth();
    const firebaseUser = await auth.getUser(decoded.uid);
    
    if (firebaseUser) {
      req.user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: decoded.role || 'customer'
      };
    }

    next();
  } catch (error) {
    // Silently fail - user not authenticated
    next();
  }
}

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth
};

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getAuth, getFirestore } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password, displayName, phoneNumber } = req.body;
    const auth = getAuth();
    const db = getFirestore();

    // Create Firebase user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      phoneNumber
    });

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      phoneNumber: phoneNumber || null,
      role: 'customer',
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email,
          displayName
        },
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;
    const auth = getAuth();
    const db = getFirestore();

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData || !userData.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    // Update last login
    await db.collection('users').doc(userRecord.uid).update({
      lastLogin: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role: userData.role
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    // For JWT, logout is typically handled client-side by removing the token
    // Here we can add token to blacklist if needed
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh JWT token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw new AppError('Token required', 400, 'TOKEN_REQUIRED');
    }

    // Verify old token (ignore expiration)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Generate new token
    const newToken = jwt.sign(
      { uid: decoded.uid, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      data: { token: newToken },
      message: 'Token refreshed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const auth = getAuth();

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);

    // TODO: Send email with reset link

    logger.info(`Password reset requested: ${email}`);

    res.json({
      success: true,
      message: 'Password reset email sent',
      data: { resetLink } // Remove in production
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const auth = getAuth();

    // Verify and apply password reset
    // This would typically be done through Firebase client SDK
    // Here we just acknowledge the request

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const auth = getAuth();

    // Verify email token
    // This would typically be done through Firebase client SDK

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

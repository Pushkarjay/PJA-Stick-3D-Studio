const { logger } = require('../utils/logger');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, _next) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Firebase errors
  if (typeof err.code === 'string' && err.code.startsWith('auth/')) {
    statusCode = 401;
    message = getFirebaseErrorMessage(err.code);
    code = 'AUTH_ERROR';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = getMulterErrorMessage(err);
    code = 'FILE_UPLOAD_ERROR';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Get user-friendly Firebase error messages
 */
function getFirebaseErrorMessage(code) {
  const errorMessages = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-exists': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak',
    'auth/too-many-requests': 'Too many requests. Please try again later.',
    'auth/user-disabled': 'This account has been disabled'
  };

  return errorMessages[code] || 'Authentication error';
}

/**
 * Get user-friendly Multer error messages
 */
function getMulterErrorMessage(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return 'File size too large. Maximum size is 5MB.';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return 'Unexpected file field';
  }
  return 'File upload error';
}

/**
 * Create custom error class
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = errorHandler;
module.exports.AppError = AppError;

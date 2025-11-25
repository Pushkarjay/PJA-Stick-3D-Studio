const admin = require('firebase-admin');
const logger = require('../utils/logger');

// Verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid token',
    });
  }
};

// Verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user found',
      });
    }

    // Get user document from Firestore
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - User not found',
      });
    }

    const userData = userDoc.data();

    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Admin access required',
      });
    }

    req.userRole = userData.role;
    next();
  } catch (error) {
    logger.error('Admin verification failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authorization',
    });
  }
};

module.exports = {
  verifyFirebaseToken,
  verifyAdmin,
};

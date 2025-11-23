const admin = require('firebase-admin');
const config = require('../config');
const logger = require('../utils/logger');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) {
    return admin;
  }

  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Initialize Firebase Admin
      if (process.env.NODE_ENV === 'production') {
        // In production (Cloud Run), use default credentials
        admin.initializeApp({
          projectId: config.gcpProjectId,
        });
      } else {
        // In development, use service account key
        const serviceAccount = require('../../config/pja3d-fire-firebase-adminsdk-fbsvc-96219dabc7.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: config.gcpProjectId,
        });
      }

      logger.info('Firebase Admin SDK initialized successfully');
    }

    initialized = true;
    return admin;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Initialize on module load
initializeFirebase();

// Export Firestore instance
const db = admin.firestore();

module.exports = {
  admin,
  db,
  initializeFirebase,
};

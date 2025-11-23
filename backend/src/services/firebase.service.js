const admin = require('firebase-admin');
const config = require('../config');
const { logger } = require('../utils/logger');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) {
    return admin;
  }

  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Initialize Firebase Admin
      if (process.env.NODE_ENV === 'production' || process.env.K_SERVICE) {
        // In production (Cloud Run), use Application Default Credentials
        admin.initializeApp({
          projectId: config.gcpProjectId || process.env.GCP_PROJECT_ID || 'pja3d-fire',
        });
        logger.info('Firebase initialized with Application Default Credentials');
      } else {
        // In development, try to use service account key
        try {
          const serviceAccount = require('../../config/pja3d-fire-firebase-adminsdk-fbsvc-96219dabc7.json');
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: config.gcpProjectId,
          });
          logger.info('Firebase initialized with service account key');
        } catch (err) {
          // Fallback to default credentials if service account not found
          admin.initializeApp({
            projectId: config.gcpProjectId || process.env.GCP_PROJECT_ID || 'pja3d-fire',
          });
          logger.info('Firebase initialized with default credentials (service account not found)');
        }
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

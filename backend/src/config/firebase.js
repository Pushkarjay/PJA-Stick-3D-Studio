const admin = require('firebase-admin');
const { logger } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

let db = null;
let storage = null;
let auth = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      logger.info('Firebase already initialized');
      return;
    }

    let credential;
    
    // On Cloud Run, use Application Default Credentials
    if (process.env.K_SERVICE) {
      logger.info('Running on Cloud Run, using Application Default Credentials');
      credential = admin.credential.applicationDefault();
    }
    // Try to use service account JSON file
    else {
      const serviceAccountPath = path.join(__dirname, '../..', 'config', 'pja3d-fire-firebase-adminsdk-fbsvc-96219dabc7.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        logger.info('Using Firebase service account JSON file');
        const serviceAccount = require(serviceAccountPath);
        credential = admin.credential.cert(serviceAccount);
      } else if (process.env.FIREBASE_PRIVATE_KEY) {
        logger.info('Using Firebase credentials from environment variables');
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
        credential = admin.credential.cert(serviceAccount);
      } else {
        throw new Error('No Firebase credentials found. Please provide service account JSON or environment variables.');
      }
    }

    admin.initializeApp({
      credential: credential,
      databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    db = admin.firestore();
    storage = admin.storage().bucket();
    auth = admin.auth();

    logger.info('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
function getFirestore() {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return db;
}

/**
 * Get Storage bucket instance
 */
function getStorage() {
  if (!storage) {
    throw new Error('Storage not initialized. Call initializeFirebase() first.');
  }
  return storage;
}

/**
 * Get Auth instance
 */
function getAuth() {
  if (!auth) {
    throw new Error('Auth not initialized. Call initializeFirebase() first.');
  }
  return auth;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getStorage,
  getAuth,
  admin
};

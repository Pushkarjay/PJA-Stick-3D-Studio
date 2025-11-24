const { Storage } = require('@google-cloud/storage');
const config = require('../config');
const { logger } = require('../utils/logger');
const path = require('path');

// Initialize Cloud Storage
let storage;
let bucket;

function initializeStorage() {
  if (bucket) return bucket; // Return cached bucket if already initialized

  if (process.env.NODE_ENV === 'production') {
    // In production, use default credentials
    storage = new Storage({
      projectId: config.gcpProjectId,
    });
  } else {
    // In development, use service account key
    const keyFilename = path.join(__dirname, '../../config/pja3d-fire-firebase-adminsdk-fbsvc-96219dabc7.json');
    storage = new Storage({
      projectId: config.gcpProjectId,
      keyFilename,
    });
  }

  if (!config.gcs.bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is not set');
  }

  bucket = storage.bucket(config.gcs.bucketName);
  return bucket;
}

/**
 * Generate a signed URL for uploading a file
 * @param {string} fileName - Name of the file to upload
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<{uploadUrl: string, publicUrl: string}>}
 */
const generateSignedUploadUrl = async (fileName, contentType) => {
  try {
    const bucket = initializeStorage();
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `products/${timestamp}-${fileName}`;
    const file = bucket.file(uniqueFileName);

    // Generate signed URL for PUT request (upload)
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    // Public URL for accessing the file (bucket is already public)
    const publicUrl = `https://storage.googleapis.com/${config.gcs.bucketName}/${uniqueFileName}`;

    logger.info(`Generated signed upload URL for: ${uniqueFileName}`);

    return {
      uploadUrl: signedUrl,
      publicUrl,
      fileName: uniqueFileName,
      expiresIn: 900, // 15 minutes in seconds
    };
  } catch (error) {
    logger.error('Failed to generate signed upload URL:', error);
    throw new Error('Failed to generate upload URL: ' + error.message);
  }
};

/**
 * Delete a file from Cloud Storage
 * @param {string} fileName - Name of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (fileName) => {
  try {
    const bucket = initializeStorage();
    
    // Extract filename from URL if full URL is provided
    let fileToDelete = fileName;
    if (fileName.includes('storage.googleapis.com')) {
      const urlParts = fileName.split('/');
      fileToDelete = urlParts.slice(urlParts.indexOf(config.gcs.bucketName) + 1).join('/');
    }

    await bucket.file(fileToDelete).delete();
    logger.info(`Deleted file: ${fileToDelete}`);
  } catch (error) {
    logger.error(`Failed to delete file ${fileName}:`, error);
    // Don't throw error if file doesn't exist
    if (error.code !== 404) {
      throw error;
    }
  }
};

module.exports = {
  initializeStorage,
  generateSignedUploadUrl,
  deleteFile,
};

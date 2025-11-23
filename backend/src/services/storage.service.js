const { Storage } = require('@google-cloud/storage');
const config = require('../config');
const logger = require('../utils/logger');
const path = require('path');

// Initialize Cloud Storage
let storage;

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

const bucket = storage.bucket(config.gcsBucketName);

/**
 * Generate a signed URL for uploading a file
 * @param {string} fileName - Name of the file to upload
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<{uploadUrl: string, publicUrl: string}>}
 */
const generateSignedUploadUrl = async (fileName, contentType) => {
  try {
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

    // Public URL for accessing the file
    const publicUrl = `https://storage.googleapis.com/${config.gcsBucketName}/${uniqueFileName}`;

    logger.info(`Generated signed upload URL for: ${uniqueFileName}`);

    return {
      uploadUrl: signedUrl,
      publicUrl,
      fileName: uniqueFileName,
      expiresIn: 900, // 15 minutes in seconds
    };
  } catch (error) {
    logger.error('Failed to generate signed upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Delete a file from Cloud Storage
 * @param {string} fileName - Name of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (fileName) => {
  try {
    // Extract filename from URL if full URL is provided
    let fileToDelete = fileName;
    if (fileName.includes('storage.googleapis.com')) {
      const urlParts = fileName.split('/');
      fileToDelete = urlParts.slice(urlParts.indexOf(config.gcsBucketName) + 1).join('/');
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
  storage,
  bucket,
  generateSignedUploadUrl,
  deleteFile,
};

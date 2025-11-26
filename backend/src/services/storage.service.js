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
    const keyFilename = path.join(__dirname, '../../config/firebase-adminsdk.json');
    storage = new Storage({
      projectId: config.gcpProjectId,
      keyFilename,
    });
  }

  // Firebase Storage bucket formats:
  // - New format: project-id.firebasestorage.app
  // - Old format: project-id.appspot.com
  // Use environment variable if set, otherwise use new Firebase Storage format
  const bucketName = config.gcs.bucketName || 
    process.env.FIREBASE_STORAGE_BUCKET || 
    `${config.gcpProjectId}.firebasestorage.app`;
  
  if (!bucketName || bucketName === '.firebasestorage.app') {
    throw new Error('Storage bucket name could not be determined. Set GCS_BUCKET_NAME, FIREBASE_STORAGE_BUCKET, or GCP_PROJECT_ID environment variable');
  }

  logger.info(`Using storage bucket: ${bucketName}`);
  bucket = storage.bucket(bucketName);
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
    const bucketName = bucket.name;
    
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

    // Public URL - Firebase Storage uses firebasestorage.googleapis.com format
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
    const encodedPath = encodeURIComponent(uniqueFileName);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

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
    const bucketName = bucket.name;
    
    // Extract filename from URL if full URL is provided
    let fileToDelete = fileName;
    if (fileName.includes('storage.googleapis.com')) {
      const urlParts = fileName.split('/');
      fileToDelete = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
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

/**
 * Upload a file buffer to Cloud Storage.
 * @param {Buffer} buffer - The file buffer to upload.
 * @param {string} originalName - The original name of the file.
 * @param {string} destinationPath - The destination path/folder in the bucket (e.g., 'settings-images').
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
const uploadFile = async (buffer, originalName, destinationPath) => {
  try {
    const bucket = initializeStorage();
    const bucketName = bucket.name;
    const timestamp = Date.now();
    const uniqueFileName = `${destinationPath}/${timestamp}-${originalName}`;
    const file = bucket.file(uniqueFileName);

    await file.save(buffer, {
      metadata: {
        // Automatically infer content type, or you can set it explicitly
        // contentType: 'image/jpeg', 
      },
      public: true, // Make the file publicly readable
    });

    // Firebase Storage public URL format
    const encodedPath = encodeURIComponent(uniqueFileName);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
    logger.info(`File uploaded to Firebase Storage: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    logger.error('Failed to upload file to Firebase Storage:', error);
    throw new Error('Failed to upload file: ' + error.message);
  }
};


module.exports = {
  initializeStorage,
  generateSignedUploadUrl,
  deleteFile,
  uploadFile,
};

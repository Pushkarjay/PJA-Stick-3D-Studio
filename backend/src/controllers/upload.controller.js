const { admin } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Get the Firebase Storage bucket name
const getBucketName = () => {
  const projectId = process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'pja3d-fire';
  return process.env.GCS_BUCKET_NAME || process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
};

/**
 * Upload product image to Firebase Storage
 */
exports.uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const bucketName = getBucketName();
    const bucket = admin.storage().bucket(bucketName);
    const timestamp = Date.now();
    const filename = `products/${timestamp}_${req.file.originalname}`;
    const file = bucket.file(filename);

    // Create write stream
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          uploadedBy: req.user?.uid || 'admin',
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Handle errors
    stream.on('error', (error) => {
      logger.error('Upload error:', error);
      next(new AppError('Failed to upload image', 500, 'UPLOAD_FAILED'));
    });

    // Handle success
    stream.on('finish', async () => {
      try {
        // Try to make the file publicly accessible
        // This may fail if bucket-level public access is not enabled
        try {
          await file.makePublic();
        } catch (publicError) {
          logger.warn('Could not make file public (bucket may not allow), using download URL:', publicError.message);
        }

        // Firebase Storage public URL format (works with Firebase Storage rules allowing read: if true)
        const encodedPath = encodeURIComponent(filename);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        logger.info(`Image uploaded successfully: ${filename}`);

        res.json({
          success: true,
          data: {
            filename,
            url: publicUrl,
            imageUrl: publicUrl,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        });
      } catch (error) {
        logger.error('Error finalizing upload:', error);
        next(new AppError('Failed to process uploaded image', 500, 'UPLOAD_FINALIZE_FAILED'));
      }
    });

    // Write the file buffer
    stream.end(req.file.buffer);

  } catch (error) {
    next(error);
  }
};

/**
 * Delete product image from Firebase Storage
 */
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const bucket = admin.storage().bucket();
    
    // Ensure filename starts with 'products/'
    const fullPath = filename.startsWith('products/') ? filename : `products/${filename}`;
    const file = bucket.file(fullPath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new AppError('Image not found', 404, 'IMAGE_NOT_FOUND');
    }

    // Delete the file
    await file.delete();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Generate a signed URL for client-side upload
 */
exports.generateUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      throw new AppError('fileName and contentType are required', 400, 'MISSING_PARAMS');
    }

    const { generateSignedUploadUrl } = require('../services/storage.service');
    const uploadData = await generateSignedUploadUrl(fileName, contentType);

    res.json({
      success: true,
      data: uploadData,
    });
  } catch (error) {
    next(error);
  }
};

const { admin } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const path = require('path');

/**
 * Upload product image to Firebase Storage
 */
exports.uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const bucket = admin.storage().bucket();
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
      throw new AppError('Failed to upload image', 500, 'UPLOAD_FAILED');
    });

    // Handle success
    stream.on('finish', async () => {
      try {
        // Make the file publicly accessible
        await file.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        res.json({
          success: true,
          data: {
            filename,
            url: publicUrl,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        });
      } catch (error) {
        logger.error('Error making file public:', error);
        throw new AppError('Failed to make image public', 500, 'PUBLIC_ACCESS_FAILED');
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

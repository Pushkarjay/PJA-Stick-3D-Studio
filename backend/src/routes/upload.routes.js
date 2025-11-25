const express = require('express');
const multer = require('multer');
const { uploadProductImage, deleteProductImage, generateUploadUrl } = require('../controllers/upload.controller');
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');

const router = express.Router();

// All routes in this file should be protected
router.use(verifyFirebaseToken, verifyAdmin);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Generate a signed URL for uploading a product image
router.post('/generate-url', generateUploadUrl);

// Legacy endpoint for direct server upload (can be deprecated)
router.post('/product', upload.single('image'), uploadProductImage);

// Delete product image
router.delete('/product/:filename', deleteProductImage);

module.exports = router;

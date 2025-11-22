const express = require('express');
const multer = require('multer');
const { uploadProductImage, deleteProductImage } = require('../controllers/upload.controller');
// const { authenticateToken } = require('../middleware/auth'); // TODO: Enable when auth is fully implemented

const router = express.Router();

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

// Upload product image (auth temporarily disabled for testing)
router.post('/product', upload.single('image'), uploadProductImage);

// Delete product image (auth temporarily disabled for testing)
router.delete('/product/:filename', deleteProductImage);

module.exports = router;

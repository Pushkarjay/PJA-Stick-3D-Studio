const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const { requireAuth } = require('../middleware/authFirebase');
const { requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const os = require('os');
const path = require('path');

// Configure multer for CSV upload to a temporary directory
const upload = multer({ dest: path.join(os.tmpdir(), 'pja3d-uploads') });

// All import routes are admin-only
router.use(requireAuth, requireAdmin);

// POST /api/import/products-csv - Import products from a CSV file
router.post('/products-csv', upload.single('file'), importController.importProductsCSV);

module.exports = router;

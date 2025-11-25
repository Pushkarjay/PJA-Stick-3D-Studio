const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

/**
 * CSV Import for products
 */
exports.importProductsCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('CSV file is required', 400, 'MISSING_FILE');
    }

    logger.info(`Starting CSV import for file: ${req.file.originalname} by ${req.user.email}`);

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Auto-casting for boolean and number strings
        if (context.header) return value; // Don't cast headers
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        // A simple check for numeric values, can be improved
        if (!isNaN(value) && value.trim() !== '') return Number(value);
        return value;
      }
    });

    const batch = db.batch();
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Pre-fetch existing categories to reduce reads inside the loop
    const categoriesSnap = await db.collection('categories').get();
    const existingCategories = new Map();
    categoriesSnap.forEach(doc => {
        existingCategories.set(doc.data().slug, { id: doc.id, ...doc.data() });
    });


    for (const [index, record] of records.entries()) {
      try {
        if (!record.name || !record.category_slug || record.basePrice === undefined) {
            throw new Error('Missing required fields: name, category_slug, basePrice');
        }
        
        let categoryId = existingCategories.get(record.category_slug)?.id;

        // If category doesn't exist, create it
        if (!categoryId) {
            const newCategoryRef = db.collection('categories').doc();
            const newCategoryData = { 
                name: record.category_name || record.category_slug, // Use name if provided, else slug
                slug: record.category_slug,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            batch.set(newCategoryRef, newCategoryData);
            categoryId = newCategoryRef.id;
            // Add to our map to avoid re-creating it in the same batch
            existingCategories.set(record.category_slug, { id: categoryId, ...newCategoryData });
            logger.info(`Auto-creating category: ${record.category_slug}`);
        }

        const productData = {
          name: record.name,
          category: categoryId,
          description: record.description || '',
          basePrice: record.basePrice,
          stockQty: record.stockQty || 0,
          productionTime: record.productionTime || '',
          isActive: record.isActive !== undefined ? record.isActive : true,
          tags: record.tags ? record.tags.split('|').map(t => t.trim()) : [],
          features: record.features ? record.features.split('|').map(f => f.trim()) : [],
          images: record.images ? record.images.split('|').map(img => img.trim()) : [],
          cost: record.cost ? JSON.parse(record.cost) : {},
          specifications: record.specifications ? JSON.parse(record.specifications) : {},
          stats: { viewCount: 0, salesCount: 0, reviewCount: 0, averageRating: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: req.user.uid
        };
        
        // Remove any undefined fields to avoid Firestore errors
        Object.keys(productData).forEach(key => productData[key] === undefined && delete productData[key]);

        const productRef = db.collection('products').doc();
        batch.set(productRef, productData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row: index + 2, data: record, error: error.message });
      }
    }

    await batch.commit();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    logger.info(`CSV import completed: ${results.success} success, ${results.failed} failed`);

    res.json({
      success: true,
      message: 'CSV import completed',
      data: results
    });
  } catch (error) {
    // Clean up file on error too
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

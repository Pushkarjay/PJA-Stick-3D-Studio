const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Get all categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    const categories = [];
    
    // Using Promise.all to fetch product counts concurrently
    await Promise.all(snapshot.docs.map(async (doc) => {
      const categoryData = doc.data();
      const productCountSnap = await db.collection('products')
        .where('category', '==', doc.id)
        .where('isActive', '==', true)
        .get();
      
      categories.push({
        id: doc.id,
        ...categoryData,
        productCount: productCountSnap.size
      });
    }));

    // Sort categories alphabetically by name after all counts are fetched
    categories.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create category
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon } = req.body;

    if (!name || !slug) {
      throw new AppError('Name and slug are required', 400, 'VALIDATION_ERROR');
    }

    // Check if slug already exists
    const existingSnap = await db.collection('categories').where('slug', '==', slug).get();
    if (!existingSnap.empty) {
      throw new AppError('Category slug already exists', 400, 'DUPLICATE_SLUG');
    }

    const category = {
      name,
      slug,
      description: description || '',
      icon: icon || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('categories').add(category);

    logger.info(`Category created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...category },
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent changing the slug if needed, or ensure it remains unique
    if (updates.slug) {
        const existingSnap = await db.collection('categories').where('slug', '==', updates.slug).get();
        if (!existingSnap.empty && existingSnap.docs[0].id !== id) {
            throw new AppError('Category slug already exists', 400, 'DUPLICATE_SLUG');
        }
    }

    await db.collection('categories').doc(id).update({
      ...updates,
      updatedAt: new Date()
    });

    logger.info(`Category updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productSnap = await db.collection('products')
      .where('category', '==', id)
      .limit(1)
      .get();

    if (!productSnap.empty) {
      throw new AppError('Cannot delete category with existing products. Please reassign products first.', 400, 'CATEGORY_HAS_PRODUCTS');
    }

    await db.collection('categories').doc(id).delete();

    logger.info(`Category deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

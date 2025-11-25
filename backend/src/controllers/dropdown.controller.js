const { db, admin } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const COLLECTION_NAME = 'dropdownOptions';

/**
 * Get all dropdown options or for a specific field.
 */
exports.getDropdownOptions = async (req, res, next) => {
  try {
    const { fieldName } = req.query;
    let options = {};

    if (fieldName) {
      const doc = await db.collection(COLLECTION_NAME).doc(fieldName).get();
      if (doc.exists) {
        options = { [fieldName]: doc.data().values || [] };
      } else {
        options = { [fieldName]: [] };
      }
    } else {
      const snapshot = await db.collection(COLLECTION_NAME).get();
      snapshot.forEach(doc => {
        options[doc.id] = doc.data().values || [];
      });
    }

    res.json({ success: true, data: options });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new value to a dropdown field's options.
 */
exports.addDropdownOption = async (req, res, next) => {
  try {
    const { fieldName, value } = req.body;
    if (!fieldName || !value) {
      throw new AppError('fieldName and value are required', 400);
    }

    const docRef = db.collection(COLLECTION_NAME).doc(fieldName);
    const doc = await docRef.get();

    if (doc.exists) {
      // Atomically add a new value to the "values" array field.
      await docRef.update({
        values: admin.firestore.FieldValue.arrayUnion(value),
        lastUpdated: new Date(),
      });
    } else {
      // If the document does not exist, create it.
      await docRef.set({
        values: [value],
        createdAt: new Date(),
        lastUpdated: new Date(),
      });
    }
    
    logger.info(`Dropdown option added to "${fieldName}": ${value} by ${req.user.email}`);
    res.status(201).json({ success: true, message: 'Dropdown option added successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a value from a dropdown field's options.
 */
exports.removeDropdownOption = async (req, res, next) => {
  try {
    const { fieldName, value } = req.body;
    if (!fieldName || !value) {
      throw new AppError('fieldName and value are required', 400);
    }

    const docRef = db.collection(COLLECTION_NAME).doc(fieldName);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new AppError(`Field "${fieldName}" not found. Check spelling of fieldName.`, 404);
    }

    // Atomically remove a value from the "values" array field.
    await docRef.update({
      values: admin.firestore.FieldValue.arrayRemove(value),
      lastUpdated: new Date(),
    });

    logger.info(`Dropdown option removed from "${fieldName}": ${value} by ${req.user.email}`);
    res.json({ success: true, message: 'Dropdown option removed successfully.' });
  } catch (error) {
    next(error);
  }
};

const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const SETTINGS_DOC_ID = 'site';

/**
 * Get site settings (public)
 */
exports.getSiteSettings = async (req, res, next) => {
  try {
    const doc = await db.collection('settings').doc(SETTINGS_DOC_ID).get();
    if (!doc.exists) {
      // If no settings exist, return a default structure
      return res.json({ success: true, data: {} });
    }
    res.json({ success: true, data: doc.data() });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all site settings for admin
 */
exports.getAdminSiteSettings = async (req, res, next) => {
    try {
      const doc = await db.collection('settings').doc(SETTINGS_DOC_ID).get();
      if (!doc.exists) {
        return res.json({ success: true, data: {} });
      }
      res.json({ success: true, data: doc.data() });
    } catch (error) {
      next(error);
    }
  };

/**
 * Update site settings (admin)
 */
exports.updateSiteSettings = async (req, res, next) => {
  try {
    const settingsData = req.body;
    if (typeof settingsData !== 'object' || settingsData === null) {
      throw new AppError('Invalid settings data.', 400);
    }

    await db.collection('settings').doc(SETTINGS_DOC_ID).set(settingsData, { merge: true });
    
    logger.info(`Site settings updated by ${req.user.email}`);
    res.json({ success: true, message: 'Site settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};

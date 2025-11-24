// Settings Controller - Manage site-wide settings
const { db } = require('../services/firebase.service');
const { logger } = require('../utils/logger');

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const settingsDoc = await db.collection('settings').doc('siteSettings').get();
    
    if (!settingsDoc.exists) {
      // Return default settings if none exist
      return res.json({
        siteTitle: 'PJA Stick & 3D Studio',
        heroTitle: 'Transform Your Ideas into Reality',
        heroSubtitle: 'Professional 3D Printing, Custom Stickers & Premium Printing Services',
        whatsappNumber: '916372362313',
        socialLinks: {
          instagram: 'https://www.instagram.com/pja_stick',
          facebook: '',
          twitter: ''
        },
        counters: {
          happyCustomers: 500,
          projectsDone: 1200,
          deliveryTime: '24-48 hours'
        },
        billingUrl: 'https://pushkarjay.github.io/KII-PRINT-BILLING/',
        logoUrl: '/assets/logos/logo-pja3d.jpg',
        logoKitPrintUrl: '/assets/logos/logo-kitprint.jpg',
        heroImageUrl: ''
      });
    }
    
    res.json(settingsDoc.data());
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    await db.collection('settings').doc('siteSettings').set(updates, { merge: true });
    
    logger.info('Settings updated successfully');
    res.json({ message: 'Settings updated successfully', data: updates });
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Upload logo/hero images
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const { fieldname } = req.file;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Update setting with new image URL
    await db.collection('settings').doc('siteSettings').set({
      [`${fieldname}Url`]: imageUrl
    }, { merge: true });
    
    res.json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    logger.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

module.exports = exports;

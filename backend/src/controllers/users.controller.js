const { db } = require('../services/firebase.service');
const admin = require('firebase-admin');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Get all users (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
      });
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin', 'super_admin'].includes(role)) {
      throw new AppError('Invalid role', 400, 'INVALID_ROLE');
    }
    
    // Prevent self-demotion
    if (req.user.uid === id && req.user.role !== role) {
        // A super_admin can't demote themselves if they are the only one
        if (req.user.role === 'super_admin') {
            const superAdminSnap = await db.collection('users').where('role', '==', 'super_admin').get();
            if (superAdminSnap.size <= 1) {
                throw new AppError('Cannot demote the only super admin.', 400, 'LAST_SUPER_ADMIN');
            }
        }
    }


    await db.collection('users').doc(id).update({
      role,
      updatedAt: new Date()
    });

    logger.info(`User ${id} role updated to ${role} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User role updated'
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Create admin user
 */
exports.createAdminUser = async (req, res, next) => {
  try {
    const { email, password, displayName, role = 'admin' } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'MISSING_PARAMS');
    }
    
    if (!['admin', 'super_admin'].includes(role)) {
        throw new AppError('Invalid role for admin creation.', 400, 'INVALID_ROLE');
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0]
    });

    // Create user document in Firestore with admin role
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info(`Admin user created: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
      }
    });
  } catch (error) {
    // If user already exists in auth, still create in firestore if they don't exist there
    if (error.code === 'auth/email-already-exists') {
        logger.warn(`Auth user ${req.body.email} already exists. Checking Firestore.`);
        // You might want to add logic here to link auth user to a new firestore doc if needed
    }
    next(error);
  }
};

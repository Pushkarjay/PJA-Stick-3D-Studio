const { db } = require('../services/firebase.service');
const { logger } = require('../utils/logger');

const COLLECTION_NAME = 'billing';

/**
 * Get billing data for the current user/admin
 */
exports.getBillingData = async (req, res, next) => {
  try {
    // Use a single document per admin or a global billing document
    const docRef = db.collection(COLLECTION_NAME).doc('global');
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.json({
        success: true,
        data: {
          billingItems: [],
          expenses: [],
          stockItems: [],
          dailySummary: []
        }
      });
    }

    res.json({
      success: true,
      data: doc.data()
    });
  } catch (error) {
    logger.error('Error fetching billing data:', error);
    next(error);
  }
};

/**
 * Save/Update billing data
 */
exports.saveBillingData = async (req, res, next) => {
  try {
    const { billingItems, expenses, stockItems, dailySummary } = req.body;

    const docRef = db.collection(COLLECTION_NAME).doc('global');
    
    await docRef.set({
      billingItems: billingItems || [],
      expenses: expenses || [],
      stockItems: stockItems || [],
      dailySummary: dailySummary || [],
      updatedAt: new Date(),
      updatedBy: req.user.email || req.user.uid
    }, { merge: true });

    logger.info(`Billing data updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Billing data saved successfully'
    });
  } catch (error) {
    logger.error('Error saving billing data:', error);
    next(error);
  }
};

/**
 * Add a single expense entry
 */
exports.addExpense = async (req, res, next) => {
  try {
    const expense = req.body;
    
    if (!expense.description || !expense.amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required'
      });
    }

    const docRef = db.collection(COLLECTION_NAME).doc('global');
    const doc = await docRef.get();
    
    let expenses = [];
    if (doc.exists && doc.data().expenses) {
      expenses = doc.data().expenses;
    }
    
    const newExpense = {
      id: Date.now().toString(),
      date: expense.date || new Date().toISOString(),
      description: expense.description,
      category: expense.category || 'Sale',
      amount: parseFloat(expense.amount),
      type: expense.type || 'Earned',
      quantity: expense.quantity || 0,
      createdAt: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    
    await docRef.set({
      expenses,
      updatedAt: new Date(),
      updatedBy: req.user.email || req.user.uid
    }, { merge: true });

    logger.info(`Expense added: ${expense.description} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: newExpense,
      message: 'Expense added successfully'
    });
  } catch (error) {
    logger.error('Error adding expense:', error);
    next(error);
  }
};

/**
 * Delete an expense entry
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const docRef = db.collection(COLLECTION_NAME).doc('global');
    const doc = await docRef.get();
    
    if (!doc.exists || !doc.data().expenses) {
      return res.status(404).json({
        success: false,
        message: 'No expenses found'
      });
    }
    
    const expenses = doc.data().expenses.filter(e => e.id !== id);
    
    await docRef.update({
      expenses,
      updatedAt: new Date(),
      updatedBy: req.user.email || req.user.uid
    });

    logger.info(`Expense deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    next(error);
  }
};

/**
 * Update stock items
 */
exports.updateStock = async (req, res, next) => {
  try {
    const { stockItems } = req.body;

    const docRef = db.collection(COLLECTION_NAME).doc('global');
    
    await docRef.set({
      stockItems: stockItems || [],
      updatedAt: new Date(),
      updatedBy: req.user.email || req.user.uid
    }, { merge: true });

    logger.info(`Stock updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Stock updated successfully'
    });
  } catch (error) {
    logger.error('Error updating stock:', error);
    next(error);
  }
};

/**
 * Reset all billing data
 */
exports.resetBillingData = async (req, res, next) => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc('global');
    
    await docRef.set({
      billingItems: [],
      expenses: [],
      stockItems: [],
      dailySummary: [],
      updatedAt: new Date(),
      updatedBy: req.user.email || req.user.uid,
      resetAt: new Date()
    });

    logger.info(`Billing data reset by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Billing data reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting billing data:', error);
    next(error);
  }
};

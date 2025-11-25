const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

// All routes in this file are for admins
router.use(verifyToken, requireAdmin);

router.get('/', usersController.getAllUsers);
router.post('/create-admin', requireSuperAdmin, usersController.createAdminUser);
router.put('/:id/role', requireSuperAdmin, usersController.updateUserRole);

module.exports = router;

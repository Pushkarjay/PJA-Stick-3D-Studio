const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');
const usersController = require('../controllers/users.controller');

// All routes in this file are for admins
router.use(verifyFirebaseToken, verifyAdmin);

router.get('/', usersController.getAllUsers);
router.post('/create-admin', usersController.createAdminUser);
router.put('/:id/role', usersController.updateUserRole);

module.exports = router;

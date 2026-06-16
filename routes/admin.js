const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
router.put('/balance/:id', authMiddleware, adminMiddleware, adminController.setUserBalance);
router.post('/balance/adjust/:id', authMiddleware, adminMiddleware, adminController.adjustBalance);
router.get('/transactions/:id', authMiddleware, adminMiddleware, adminController.getTransactions);
router.get('/orders/:userId', authMiddleware, adminMiddleware, adminController.getUserOrders);

module.exports = router;
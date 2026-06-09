const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.put('/balance/:id', adminController.setUserBalance);
router.post('/balance/adjust/:id', adminController.adjustBalance);
router.get('/transactions/:id', adminController.getTransactions);
router.get('/orders/:userId', adminController.getUserOrders);

module.exports = router;

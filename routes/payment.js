const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/payment-settings', paymentController.getPaymentSettings);
router.put('/payment-settings', authMiddleware, adminMiddleware, paymentController.updatePaymentSettings);

module.exports = router;
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/payment-settings', paymentController.getPaymentSettings);
router.put('/payment-settings', paymentController.updatePaymentSettings);

module.exports = router;
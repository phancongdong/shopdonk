const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders', orderController.getOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', orderController.getOrderById);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.put('/orders/:id/cancel', orderController.cancelOrder);

module.exports = router;
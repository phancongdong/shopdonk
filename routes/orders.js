const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/orders', authMiddleware, orderController.getOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);
router.post('/orders', authMiddleware, orderController.createOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.put('/orders/:id/cancel', authMiddleware, orderController.cancelOrder);

router.get('/admin/orders', orderController.getAllOrdersAdmin);
router.get('/admin/orders/recent', orderController.getRecentOrders);
router.get('/admin/orders/today', orderController.getOrdersCountToday);

module.exports = router;
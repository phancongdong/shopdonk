const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/orders', authMiddleware, orderController.getOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);
router.get('/orders/:id/account', authMiddleware, orderController.getOrderAccount);
router.post('/orders', authMiddleware, orderController.createOrder);
router.put('/orders/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.put('/orders/:id/cancel', authMiddleware, orderController.cancelOrder);

router.get('/admin/orders', authMiddleware, adminMiddleware, orderController.getAllOrdersAdmin);
router.get('/admin/orders/recent', authMiddleware, adminMiddleware, orderController.getRecentOrders);
router.get('/admin/orders/today', authMiddleware, adminMiddleware, orderController.getOrdersCountToday);

module.exports = router;
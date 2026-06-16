const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/deposits', authMiddleware, depositController.getDeposits);
router.post('/deposits', authMiddleware, depositController.createDeposit);
router.post('/deposits/admin/add', authMiddleware, adminMiddleware, depositController.adminAddDeposit);
router.post('/deposits/bank-transfer', authMiddleware, depositController.bankTransferDeposit);
router.post('/deposits/:id/approve', authMiddleware, adminMiddleware, depositController.approveDeposit);
router.post('/deposits/:id/reject', authMiddleware, adminMiddleware, depositController.rejectDeposit);

module.exports = router;
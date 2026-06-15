const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');

router.get('/deposits', depositController.getDeposits);
router.post('/deposits', depositController.createDeposit);
router.post('/deposits/admin/add', depositController.adminAddDeposit);
router.post('/deposits/bank-transfer', depositController.bankTransferDeposit);
router.post('/deposits/:id/approve', depositController.approveDeposit);
router.post('/deposits/:id/reject', depositController.rejectDeposit);

module.exports = router;
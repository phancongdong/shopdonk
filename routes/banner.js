const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/banners', bannerController.getBanners);
router.get('/banners/all', bannerController.getAllBanners);
router.post('/banners', authMiddleware, adminMiddleware, bannerController.createBanner);
router.put('/banners/:id', authMiddleware, adminMiddleware, bannerController.updateBanner);
router.delete('/banners/:id', authMiddleware, adminMiddleware, bannerController.deleteBanner);

module.exports = router;
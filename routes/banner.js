const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

router.get('/banners', bannerController.getBanners);
router.get('/banners/all', bannerController.getAllBanners);
router.post('/banners', bannerController.createBanner);
router.put('/banners/:id', bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);

module.exports = router;
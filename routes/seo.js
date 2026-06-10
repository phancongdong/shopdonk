const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');

function requireAdmin(req, res, next) {
    const user = JSON.parse(req.headers['x-user'] || 'null');
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }
    next();
}

router.get('/seo', requireAdmin, seoController.getSeoSettings);
router.post('/seo', requireAdmin, seoController.saveSeoSettings);
router.post('/seo/sitemap', requireAdmin, seoController.generateSitemap);

module.exports = router;
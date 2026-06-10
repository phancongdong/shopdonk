const express = require('express');
const router = express.Router();
const pageSeoController = require('../controllers/pageSeoController');

// Public endpoints
router.get('/seo/page/:page', pageSeoController.getPageSeo);
router.get('/seo/category/:id', pageSeoController.getCategorySeo);

// Admin endpoints - require auth
function requireAdmin(req, res, next) {
    const user = JSON.parse(req.headers['x-user'] || 'null');
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }
    next();
}

router.get('/seo/pages', requireAdmin, pageSeoController.getAllPageSeo);
router.post('/seo/page/:page', requireAdmin, pageSeoController.savePageSeo);
router.get('/seo/categories', requireAdmin, pageSeoController.getAllCategorySeo);
router.post('/seo/category/:id', requireAdmin, pageSeoController.saveCategorySeo);

module.exports = router;
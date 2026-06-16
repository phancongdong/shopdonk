const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware, ctvMiddleware } = require('../middleware/auth');

router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/slug/:slug', productController.getProductBySlug);
router.post('/products', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, ctvMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

router.get('/categories', productController.getCategories);
router.get('/categories/tree', productController.getCategoryTree);
router.get('/categories/select', productController.getCategories);
router.get('/categories/:id', productController.getCategoryById);
router.get('/categories/:id/path', productController.getCategoryPath);
router.get('/categories/:id/products', productController.getCategoryProducts);
router.post('/categories', authMiddleware, adminMiddleware, productController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, productController.updateCategory);
router.put('/categories/:id/move', authMiddleware, adminMiddleware, productController.moveCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, productController.deleteCategory);

module.exports = router;
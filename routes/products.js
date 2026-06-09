const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/slug/:slug', productController.getProductBySlug);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

router.get('/categories', productController.getCategories);
router.get('/categories/:id', productController.getCategoryById);
router.post('/categories', productController.createCategory);
router.put('/categories/:id', productController.updateCategory);
router.delete('/categories/:id', productController.deleteCategory);

module.exports = router;
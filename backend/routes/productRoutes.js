const express = require('express');
const ProductController = require('../controllers/ProductController');

module.exports = (authenticateToken, isAdmin) => {
    const router = express.Router();

    router.get('/', authenticateToken, ProductController.getAllProducts);
    router.get('/:id', authenticateToken, ProductController.getProductById);
    router.post('/', authenticateToken, ProductController.createProduct);
    router.put('/:id', authenticateToken, ProductController.updateProduct);
    router.delete('/:id', authenticateToken, ProductController.deleteProduct);

    return router;
};
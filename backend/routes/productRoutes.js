const express = require('express');
const ProductController = require('../controllers/ProductController');

module.exports = (authenticateToken, isAdmin) => {
    const router = express.Router();

    router.post('/', authenticateToken, isAdmin, ProductController.createProduct);
    router.get('/', authenticateToken, isAdmin, ProductController.getAllProducts);
    router.put('/:id', authenticateToken, isAdmin, ProductController.updateProduct);
    router.get('/:id', authenticateToken, isAdmin, ProductController.getProductById);
    router.delete('/:id', authenticateToken, isAdmin, ProductController.deleteProduct);

    return router;
};
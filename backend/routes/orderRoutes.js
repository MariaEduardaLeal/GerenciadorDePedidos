const express = require('express');
const OrderController = require('../controllers/OrderController');

module.exports = (authenticateToken) => {
    const router = express.Router();

    router.get('/', authenticateToken, OrderController.getAllOrders);
    router.post('/', authenticateToken, OrderController.createOrder);
    router.get('/:id', authenticateToken, OrderController.getOrderById);
    router.put('/:id', authenticateToken, OrderController.updateOrder);
    router.put('/:id/complete', authenticateToken, OrderController.completeOrder);
    router.delete('/:id', authenticateToken, OrderController.deleteOrder);

    return router;
};
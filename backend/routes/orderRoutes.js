const express = require('express');
const OrderController = require('../controllers/OrderController');

module.exports = (authenticateToken) => {
    const router = express.Router();

    router.get('/', authenticateToken, OrderController.getAllOrders);
    router.get('/:id', authenticateToken, OrderController.getOrderById);
    router.post('/', authenticateToken, OrderController.createOrder);
    router.put('/:id', authenticateToken, OrderController.updateOrder);
    router.delete('/:id', authenticateToken, OrderController.deleteOrder);
    router.put('/:id/complete', authenticateToken, OrderController.completeOrder);
    router.put('/:id/start', authenticateToken, OrderController.startOrder); 

    return router;
};
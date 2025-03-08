const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

class OrderController {
    static async getAllOrders(req, res) {
        try {
            const orders = await Order.findAll({
                include: [{ model: OrderItem, include: [Product] }],
            });
            res.json(orders);
        } catch (error) {
            console.error('Erro ao listar pedidos:', error);
            res.status(500).json({ error: 'Erro ao listar pedidos' });
        }
    }

    static async getOrderById(req, res) {
        const { id } = req.params;
        try {
            const order = await Order.findByPk(id, {
                include: [{ model: OrderItem, include: [Product] }],
            });
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
            res.json(order);
        } catch (error) {
            console.error('Erro ao buscar pedido:', error);
            res.status(500).json({ error: 'Erro ao buscar pedido' });
        }
    }

    static async createOrder(req, res) {
        const { order_name, customer_name, observation, items } = req.body;

        if (!order_name || !customer_name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Mesa/Destino, nome do cliente e itens são obrigatórios' });
        }

        try {
            let total_price = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    return res.status(404).json({ error: `Produto com ID ${item.product_id} não encontrado` });
                }
                const subtotal = product.price * item.quantity;
                total_price += subtotal;
                orderItems.push({
                    order_id: null,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    subtotal,
                });
            }

            const order = await Order.create({
                user_id: req.user.id,
                total_price,
                status: 'in_progress',
                observation,
                order_name,
                customer_name,
            });

            orderItems.forEach(item => (item.order_id = order.id));
            await OrderItem.bulkCreate(orderItems);

            res.status(201).json({ message: 'Pedido criado com sucesso', order });
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            res.status(500).json({ error: 'Erro ao criar pedido' });
        }
    }

    static async updateOrder(req, res) {
        const { id } = req.params;
        const { order_name, customer_name, observation, items } = req.body;

        if (!order_name || !customer_name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Mesa/Destino, nome do cliente e itens são obrigatórios' });
        }

        try {
            const order = await Order.findByPk(id, { include: OrderItem });
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            let total_price = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    return res.status(404).json({ error: `Produto com ID ${item.product_id} não encontrado` });
                }
                const subtotal = product.price * item.quantity;
                total_price += subtotal;
                orderItems.push({
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    subtotal,
                });
            }

            await order.update({
                order_name,
                customer_name,
                observation,
                total_price,
            });

            await OrderItem.destroy({ where: { order_id: order.id } });
            await OrderItem.bulkCreate(orderItems);

            res.json({ message: 'Pedido atualizado com sucesso', order });
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            res.status(500).json({ error: 'Erro ao atualizar pedido' });
        }
    }

    static async deleteOrder(req, res) {
        const { id } = req.params;

        try {
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            await OrderItem.destroy({ where: { order_id: order.id } });
            await order.destroy();

            res.json({ message: 'Pedido excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir pedido:', error);
            res.status(500).json({ error: 'Erro ao excluir pedido' });
        }
    }
}

module.exports = OrderController;
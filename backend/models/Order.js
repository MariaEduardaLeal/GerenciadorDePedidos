const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'complete', 'canceled'), 
        defaultValue: 'pending',
    },
    observation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    customer_name: { 
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    payment_type: {
        type: DataTypes.ENUM('pix', 'especie', 'cartao', 'ceu_rasa'),
        allowNull: false,
        defaultValue: 'pix',
    },
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Order;
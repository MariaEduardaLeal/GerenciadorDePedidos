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
        type: DataTypes.ENUM('in_progress', 'complete', 'canceled'),
        defaultValue: 'in_progress',
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
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Order;
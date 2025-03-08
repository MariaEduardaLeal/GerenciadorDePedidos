const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Order = require('./Order');
const User = require('./User');

const OrderLog = sequelize.define('OrderLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('in_progress', 'complete', 'canceled'),
        defaultValue: 'in_progress',
    },
    action: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    observation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
    },
}, {
    tableName: 'order_logs',
    timestamps: false,
});

OrderLog.belongsTo(Order, { foreignKey: 'order_id' });
OrderLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = OrderLog;
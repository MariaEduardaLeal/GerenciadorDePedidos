const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Product;
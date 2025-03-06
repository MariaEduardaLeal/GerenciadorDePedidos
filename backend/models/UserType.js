const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

const UserType = sequelize.define('UserType', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo: {
        type: DataTypes.ENUM('P', 'C', 'A'),
        allowNull: false,
        defaultValue: 'P',
        comment: 'P - pedido; C - cozinha; A - administrador'
    }
},
    {
        tableName: 'user_types',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

module.exports = UserType;
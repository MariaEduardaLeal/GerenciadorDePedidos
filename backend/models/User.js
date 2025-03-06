const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const UserType = require('./UserType');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user_types',
            key: 'id',
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    remember_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

User.belongsTo(UserType, { foreignKey: 'user_type_id', as: 'userType' });

module.exports = User;
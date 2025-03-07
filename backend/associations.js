const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Product = require('./models/Product');
const User = require('./models/User');

function defineAssociations() {
    // User -> Order (1:N)
    User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    Order.belongsTo(User, { foreignKey: 'user_id' });

    // Order -> OrderItem (1:N)
    Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

    // Product -> OrderItem (1:N)
    Product.hasMany(OrderItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
}

module.exports = defineAssociations;
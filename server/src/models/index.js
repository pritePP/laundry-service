const sequelize = require('../config/config');
const User = require('./User');
const Service = require('./Service');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');

// Define associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderDetail, { foreignKey: 'orderId' });
OrderDetail.belongsTo(Order, { foreignKey: 'orderId' });

Service.hasMany(OrderDetail, { foreignKey: 'serviceId' });
OrderDetail.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = {
  sequelize,
  User,
  Service,
  Order,
  OrderDetail
};

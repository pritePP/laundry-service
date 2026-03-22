const { sequelize, Order } = require('./src/models');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    const orderCount = await Order.count();
    console.log('Total orders in database:', orderCount);
    
    const completedOrders = await Order.findAll({
      where: { status: 'Completed' },
      attributes: ['totalPrice']
    });
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
    console.log('Completed orders revenue:', totalRevenue);
    
    const allOrders = await Order.findAll({
      attributes: ['status', 'totalPrice']
    });
    
    console.log('All orders:');
    allOrders.forEach(order => {
      console.log(`  ID: ${order.id}, Status: ${order.status}, Price: ${order.totalPrice}`);
    });
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();

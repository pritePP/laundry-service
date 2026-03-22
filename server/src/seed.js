const { sequelize, User, Service, Order, OrderDetail } = require('./models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@laundry.com',
      password: hashedPassword,
      phone: '555-0100',
      role: 'admin',
      status: 'active'
    });
    console.log('Admin user created:', adminUser.email);

    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('user123', 10),
      phone: '555-0101',
      role: 'user',
      status: 'active'
    });
    console.log('Regular user created:', regularUser.email);

    // Create sample services
    const services = [
  {
    name: 'ซักผ้าปกติ',
    price: 80,
    description: 'บริการซักผ้าทั่วไปสำหรับเสื้อผ้าประจำวัน'
  },
  {
    name: 'ซักแห้ง',
    price: 150,
    description: 'บริการซักแห้งสำหรับเสื้อผ้าที่ต้องการการดูแลพิเศษ'
  },
  {
    name: 'บริการรีดผ้า',
    price: 15,
    description: 'บริการรีดผ้าให้เรียบสวยสำหรับเสื้อผ้าทุกประเภท'
  },
  {
    name: 'ซักด่วน',
    price: 120,
    description: 'บริการซักผ้าแบบด่วนเสร็จภายใน 2 ชั่วโมง'
  },
  {
    name: 'ฟอกขาว',
    price: 100,
    description: 'บริการฟอกขาวสำหรับเสื้อผ้าสีขาว'
  },
  {
    name: 'ขจัดคราบ',
    price: 150,
    description: 'บริการขจัดคราบฝังแน่นโดยผู้เชี่ยวชาญ'
  }
];
    for (const serviceData of services) {
      const service = await Service.create(serviceData);
      console.log('Service created:', service.name);
    }

    // Create sample orders
    const createdServices = await Service.findAll();
    const testUser = await User.findOne({ where: { email: 'john@example.com' } });

    if (createdServices.length > 0 && testUser) {
      // Sample order 1
      const order1 = await Order.create({
        userId: testUser.id,
        totalPrice: 195,
        status: 'Completed'
      });

      await OrderDetail.create({
        orderId: order1.id,
        serviceId: createdServices[0].id, // ซักผ้าปกติ
        quantity: 1
      });

      await OrderDetail.create({
        orderId: order1.id,
        serviceId: createdServices[2].id, // บริการรีดผ้า
        quantity: 1
      });

      // Sample order 2
      const order2 = await Order.create({
        userId: testUser.id,
        totalPrice: 150,
        status: 'Processing'
      });

      await OrderDetail.create({
        orderId: order2.id,
        serviceId: createdServices[1].id, // ซักแห้ง
        quantity: 1
      });

      // Sample order 3
      const order3 = await Order.create({
        userId: testUser.id,
        totalPrice: 200,
        status: 'Pending'
      });

      await OrderDetail.create({
        orderId: order3.id,
        serviceId: createdServices[3].id, // ซักด่วน
        quantity: 1
      });

      await OrderDetail.create({
        orderId: order3.id,
        serviceId: createdServices[4].id, // ฟอกขาว
        quantity: 1
      });

      console.log('Sample orders created successfully!');
    }

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@laundry.com / admin123');
    console.log('User: john@example.com / user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();

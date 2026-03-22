const { User, Order } = require('../models');

// Get all customers (Admin only)
const getCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt'],
      include: [
        {
          model: Order,
          attributes: ['id', 'status', 'totalPrice', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'status', 'createdAt']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getUserProfile
};

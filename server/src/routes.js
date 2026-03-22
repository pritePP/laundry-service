const express = require('express');
const router = express.Router();
const passport = require('passport');

// Import controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const serviceController = require('./controllers/serviceController');
const orderController = require('./controllers/orderController');

// Import middleware
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// User routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.get('/customers', authenticateToken, requireAdmin, userController.getCustomers);

// Service routes
router.get('/services', serviceController.getServices);
router.get('/services/:id', serviceController.getServiceById);
router.post('/services', authenticateToken, requireAdmin, serviceController.upload.single('image'), serviceController.createService);
router.put('/services/:id', authenticateToken, requireAdmin, serviceController.upload.single('image'), serviceController.updateService);
router.delete('/services/:id', authenticateToken, requireAdmin, serviceController.deleteService);

// Order routes
router.post('/orders', authenticateToken, orderController.createOrder);
router.get('/orders', authenticateToken, orderController.getUserOrders);
router.get('/orders/all', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/orders/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.put('/orders/:id/cancel', authenticateToken, orderController.cancelOrder);
router.get('/revenue', authenticateToken, requireAdmin, orderController.getRevenueReport);

module.exports = router;

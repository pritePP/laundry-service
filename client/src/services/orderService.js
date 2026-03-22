import api from './api';

export const orderService = {
  // Create new order
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  async getUserOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get all orders (admin)
  async getAllOrders() {
    const response = await api.get('/orders/all');
    return response.data;
  },

  // Update order status (admin)
  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel order
  async cancelOrder(orderId) {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // Get revenue report (admin)
  async getRevenueReport() {
    const response = await api.get('/revenue');
    return response.data;
  }
};

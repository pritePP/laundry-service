import api from './api';

export const userService = {
  // Get all customers (admin)
  async getCustomers() {
    const response = await api.get('/customers');
    return response.data;
  }
};

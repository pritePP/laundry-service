import api from './api';

export const authService = {
  // Register user
  async register(userData) {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Get user profile
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  }
};

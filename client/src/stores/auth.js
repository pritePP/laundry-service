import { defineStore } from 'pinia';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user
  },

  actions: {
    // Initialize auth state from localStorage
    initializeAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
      }
    },

    // Register user
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(userData);
        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Login user
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials);
        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Logout user
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // Clear error
    clearError() {
      this.error = null;
    }
  },

  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['user', 'token', 'isAuthenticated']
  }
});

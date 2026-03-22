<template>
  <div id="app">
    <!-- Navigation -->
    <nav v-if="showNavigation" class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-icon">🧼</span>
            <span class="brand-text">Fresh Laundry</span>
          </router-link>
        </div>
        
        <div class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link v-if="isAuthenticated && !isAdmin" to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link v-if="isAuthenticated && !isAdmin" to="/create-order" class="nav-link">Create Order</router-link>
          <router-link v-if="isAuthenticated && !isAdmin" to="/order-history" class="nav-link">Order History</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">Admin</router-link>
        </div>
        
        <div class="nav-auth">
          <template v-if="isAuthenticated">
            <span class="user-name">{{ user?.name }}</span>
            <button @click="logout" class="btn btn-outline">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-outline">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Sign Up</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="{ 'with-nav': showNavigation }">
      <router-view />
    </main>

    <!-- Footer -->
    <footer v-if="showNavigation" class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Fresh Laundry Service</h4>
            <p>Professional laundry service at your fingertips</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <router-link to="/">Home</router-link>
            <router-link v-if="isAuthenticated && !isAdmin" to="/dashboard">Dashboard</router-link>
            <router-link v-if="isAuthenticated && !isAdmin" to="/create-order">Create Order</router-link>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>📧 info@freshlaundry.com</p>
            <p>📞 (555) 123-4567</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 Fresh Laundry Service. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isAdmin = computed(() => authStore.isAdmin);
    const user = computed(() => authStore.user);
    
    const showNavigation = computed(() => {
      const hideNavRoutes = ['/login', '/register'];
      return !hideNavRoutes.includes(route.path);
    });
    
    const logout = () => {
      authStore.logout();
      router.push('/');
    };
    
    return {
      isAuthenticated,
      isAdmin,
      user,
      showNavigation,
      logout
    };
  }
};
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background-color: #F8FAFB;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* Button Styles */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #4A90E2;
  color: white;
}

.btn-primary:hover {
  background: #357ABD;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #4A90E2;
  border: 2px solid #4A90E2;
}

.btn-outline:hover {
  background: #4A90E2;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 16px;
}

/* Navigation */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  width: 100%;
}

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
}

.brand-icon {
  font-size: 2rem;
  margin-right: 10px;
}

.brand-text {
  color: #4A90E2;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #5a6c7d;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #4A90E2;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4A90E2;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  color: #2c3e50;
  font-weight: 600;
}

/* Main Content */
main {
  flex: 1;
  width: 100%;
  max-width: 100%;
}

main.with-nav {
  padding-top: 70px;
  min-height: calc(100vh - 70px);
}

/* Footer */
.footer {
  background: #2c3e50;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h4 {
  margin-bottom: 15px;
  color: #87CEEB;
}

.footer-section p,
.footer-section a {
  color: #b8c5d6;
  text-decoration: none;
  line-height: 1.8;
}

.footer-section a:hover {
  color: #87CEEB;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  color: #b8c5d6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
  }
  
  .nav-menu {
    margin: 15px 0;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-auth {
    margin-top: 15px;
  }
  
  main.with-nav {
    padding-top: 120px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4A90E2;
}

/* Alert Styles */
.alert {
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  border-bottom: 1px solid #e1e8ed;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.card-header h3 {
  color: #2c3e50;
  margin: 0;
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.p-20 {
  padding: 20px;
}
</style>

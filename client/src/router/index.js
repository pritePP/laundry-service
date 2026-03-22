import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Import views
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import UserDashboard from '../views/UserDashboard.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import CreateOrder from '../views/CreateOrder.vue';
import OrderHistory from '../views/OrderHistory.vue';
import ManageServices from '../views/ManageServices.vue';
import ManageOrders from '../views/ManageOrders.vue';
import Customers from '../views/Customers.vue';
import Revenue from '../views/Revenue.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-order',
    name: 'CreateOrder',
    component: CreateOrder,
    meta: { requiresAuth: true, requiresUser: true }
  },
  {
    path: '/order-history',
    name: 'OrderHistory',
    component: OrderHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/services',
    name: 'ManageServices',
    component: ManageServices,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'ManageOrders',
    component: ManageOrders,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/customers',
    name: 'Customers',
    component: Customers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/revenue',
    name: 'Revenue',
    component: Revenue,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth state if not already done
  if (!authStore.isAuthenticated && authStore.token) {
    authStore.initializeAuth();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard');
  } else if (to.meta.requiresUser && authStore.isAdmin) {
    next('/admin');
  } else {
    next();
  }
});

export default router;

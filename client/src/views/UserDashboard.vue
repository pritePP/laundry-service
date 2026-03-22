<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Welcome, {{ user?.name }}!</h1>
        <p>Manage your laundry orders and services</p>
      </div>
      <div class="header-actions">
        <button @click="logout" class="btn btn-secondary">Logout</button>
      </div>
    </header>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <div v-if="!authStore.isAdmin" class="action-card" @click="$router.push('/create-order')">
        <div class="action-icon">➕</div>
        <h3>Create Order</h3>
        <p>Place a new laundry order</p>
      </div>
      <div class="action-card" @click="$router.push('/order-history')">
        <div class="action-icon">📋</div>
        <h3>Order History</h3>
        <p>View your past orders</p>
      </div>
    </section>

    <!-- Recent Orders -->
    <section class="recent-orders">
      <div class="section-header">
        <h2>Recent Orders</h2>
        <router-link to="/order-history" class="view-all">View All</router-link>
      </div>
      
      <div v-if="loading" class="loading">Loading orders...</div>
      
      <div v-else-if="recentOrders.length === 0" class="empty-state">
        <p>No orders yet. <span v-if="!authStore.isAdmin"><router-link to="/create-order">Create your first order</router-link></span><span v-else>Contact a customer to create orders.</span></p>
      </div>
      
      <div v-else class="orders-list">
        <div v-for="order in recentOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div>
              <h4>Order #{{ order.id }}</h4>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
            <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
          </div>
          
          <div class="order-details">
            <div class="order-items">
              <p v-for="detail in order.OrderDetails" :key="detail.id">
                {{ detail.Service.name }} x {{ detail.quantity }}
              </p>
            </div>
            <div class="order-total">
              <p class="order-price">฿{{ order.totalPrice }}</p>
            </div>
          </div>
          
          <div class="order-actions">
            <button 
              v-if="order.status === 'Pending'" 
              @click="cancelOrder(order.id)"
              class="btn btn-danger btn-sm"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { orderService } from '../services/orderService';

export default {
  name: 'UserDashboard',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const recentOrders = ref([]);
    const loading = ref(false);
    
    const user = computed(() => authStore.user);
    
    const fetchRecentOrders = async () => {
      loading.value = true;
      try {
        const orders = await orderService.getUserOrders();
        recentOrders.value = orders.slice(0, 5); // Show only 5 most recent
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const cancelOrder = async (orderId) => {
      if (!confirm('Are you sure you want to cancel this order?')) return;
      
      try {
        await orderService.cancelOrder(orderId);
        await fetchRecentOrders(); // Refresh the list
      } catch (error) {
        console.error('Failed to cancel order:', error);
      }
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    const logout = () => {
      authStore.logout();
      router.push('/');
    };
    
    onMounted(() => {
      fetchRecentOrders();
    });
    
    return {
      user,
      recentOrders,
      loading,
      cancelOrder,
      formatDate,
      logout,
      authStore
    };
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #F8FAFB;
  padding: 0;
}

.user-dashboard {
  padding: 20px;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 2rem;
}

.header-content p {
  color: #5a6c7d;
  margin: 0;
}

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
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.action-card p {
  color: #5a6c7d;
  margin: 0;
}

.recent-orders {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.view-all {
  color: #4A90E2;
  text-decoration: none;
  font-weight: 600;
}

.view-all:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
}

.empty-state a {
  color: #4A90E2;
  text-decoration: none;
  font-weight: 600;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.order-header h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.order-date {
  color: #5a6c7d;
  font-size: 14px;
  margin: 0;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.processing {
  background: #cce5ff;
  color: #004085;
}

.status.ready {
  background: #d4edda;
  color: #155724;
}

.status.completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.order-items p {
  margin: 0 0 5px 0;
  color: #5a6c7d;
  font-size: 14px;
}

.order-total {
  color: #2c3e50;
  font-size: 16px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-details {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Manage your laundry service business</p>
      </div>
      <button @click="fetchStats" class="btn btn-secondary refresh-btn">
        🔄 Refresh
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>{{ stats.totalOrders }}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>฿{{ stats.totalRevenue }}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ stats.totalCustomers }}</h3>
          <p>Total Customers</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h3>{{ stats.pendingOrders }}</h3>
          <p>Pending Orders</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="recent-activity">
        <h2>Recent Orders</h2>
        <div v-if="loadingOrders" class="loading">Loading orders...</div>
        <div v-else class="orders-list">
          <div v-for="order in recentOrders.slice(0, 5)" :key="order.id" class="order-item">
            <div class="order-info">
              <h4>Order #{{ order.id }}</h4>
              <p>{{ order.User?.name }} - {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status">
              <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
              <p>฿{{ order.totalPrice }}</p>
            </div>
          </div>
        </div>
        <router-link to="/admin/orders" class="view-all-link">View All Orders</router-link>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/admin/orders" class="action-card">
            <div class="action-icon">📋</div>
            <h3>Manage Orders</h3>
            <p>Update order statuses</p>
          </router-link>
          
          <router-link to="/admin/services" class="action-card">
            <div class="action-icon">🧼</div>
            <h3>Manage Services</h3>
            <p>Add/edit laundry services</p>
          </router-link>
          
          <router-link to="/admin/customers" class="action-card">
            <div class="action-icon">👥</div>
            <h3>View Customers</h3>
            <p>Manage customer accounts</p>
          </router-link>
          
          <router-link to="/admin/revenue" class="action-card">
            <div class="action-icon">💰</div>
            <h3>Revenue Report</h3>
            <p>View financial insights</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref({
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      pendingOrders: 0
    });
    
    const recentOrders = ref([]);
    const loadingOrders = ref(false);
    
    const fetchStats = async () => {
      try {
        // Get revenue stats
        const revenueData = await orderService.getRevenueReport();
        console.log('Revenue data from API:', revenueData);
        stats.value.totalRevenue = revenueData.totalRevenue;
        stats.value.totalOrders = revenueData.totalOrders;
        console.log('Updated stats:', stats.value);
        
        // Get all orders to calculate pending
        const allOrders = await orderService.getAllOrders();
        stats.value.pendingOrders = allOrders.filter(order => order.status === 'Pending').length;
        recentOrders.value = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Get customers
        const customers = await userService.getCustomers();
        stats.value.totalCustomers = customers.length;
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    
    // Listen for page visibility changes to refresh stats when returning to dashboard
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };
    
    // Listen for order completion events from other pages
    const handleOrderCompleted = () => {
      console.log('Order completed event received, refreshing stats...');
      fetchStats();
    };
    
    // Auto refresh stats every 30 seconds
    const autoRefresh = setInterval(() => {
      fetchStats();
    }, 30000);
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    onMounted(() => {
      fetchStats();
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('orderCompleted', handleOrderCompleted);
    });
    
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orderCompleted', handleOrderCompleted);
      clearInterval(autoRefresh);
    });
    
    return {
      stats,
      recentOrders,
      loadingOrders,
      formatDate
    };
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.dashboard-header p {
  color: #5a6c7d;
  font-size: 1.1rem;
}

.refresh-btn {
  padding: 10px 20px;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 3rem;
  min-width: 60px;
  text-align: center;
}

.stat-content h3 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 2rem;
}

.stat-content p {
  color: #5a6c7d;
  margin: 0;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.recent-activity, .quick-actions {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.recent-activity h2, .quick-actions h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #5a6c7d;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
}

.order-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.order-info p {
  color: #5a6c7d;
  margin: 0;
  font-size: 14px;
}

.order-status {
  text-align: right;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 5px;
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

.order-status p {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.view-all-link {
  color: #4A90E2;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  margin-top: 10px;
}

.view-all-link:hover {
  text-decoration: underline;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.action-card {
  display: block;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  text-align: center;
}

.action-card:hover {
  border-color: #4A90E2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.action-card .action-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.action-card p {
  color: #5a6c7d;
  margin: 0;
  font-size: 14px;
}

@media (max-width: 968px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .order-item {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .order-status {
    text-align: center;
  }
}
</style>

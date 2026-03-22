<template>
  <div class="customers">
    <div class="page-header">
      <h1>Customers</h1>
      <div class="header-actions">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search customers..."
          class="search-input"
        />
      </div>
    </div>

    <div class="customers-container">
      <div v-if="loading" class="loading">Loading customers...</div>
      
      <div v-else-if="filteredCustomers.length === 0" class="empty-state">
        <h3>No Customers Found</h3>
        <p>{{ searchQuery ? 'No customers match your search.' : 'No customers have registered yet.' }}</p>
      </div>
      
      <div v-else class="customers-grid">
        <div v-for="customer in filteredCustomers" :key="customer.id" class="customer-card">
          <div class="customer-header">
            <div class="customer-info">
              <h3>{{ customer.name }}</h3>
              <p>{{ customer.email }}</p>
              <p v-if="customer.phone">{{ customer.phone }}</p>
            </div>
            <div class="customer-status">
              <span :class="['status', customer.status.toLowerCase()]">{{ customer.status }}</span>
            </div>
          </div>
          
          <div class="customer-stats">
            <div class="stat">
              <span class="stat-label">Total Orders:</span>
              <span class="stat-value">{{ customer.Orders?.length || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Spent:</span>
              <span class="stat-value">฿{{ calculateTotalSpent(customer) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Member Since:</span>
              <span class="stat-value">{{ formatDate(customer.createdAt) }}</span>
            </div>
          </div>
          
          <div class="customer-orders">
            <h4>Recent Orders</h4>
            <div v-if="customer.Orders?.length === 0" class="no-orders">
              No orders yet
            </div>
            <div v-else class="orders-list">
              <div 
                v-for="order in customer.Orders?.slice(0, 3)" 
                :key="order.id" 
                class="order-item"
              >
                <span class="order-id">#{{ order.id }}</span>
                <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
                <span class="order-price">${{ order.totalPrice }}</span>
              </div>
            </div>
            <div v-if="customer.Orders?.length > 3" class="view-more">
              <router-link :to="`/admin/orders?customer=${customer.id}`" class="view-all-link">
                View all {{ customer.Orders.length }} orders
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { userService } from '../services/userService';

export default {
  name: 'Customers',
  setup() {
    const customers = ref([]);
    const loading = ref(false);
    const searchQuery = ref('');
    
    const filteredCustomers = computed(() => {
      if (!searchQuery.value) {
        return customers.value;
      }
      
      const query = searchQuery.value.toLowerCase();
      return customers.value.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.includes(query))
      );
    });
    
    const fetchCustomers = async () => {
      loading.value = true;
      try {
        customers.value = await userService.getCustomers();
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const calculateTotalSpent = (customer) => {
      if (!customer.Orders || customer.Orders.length === 0) {
        return '0.00';
      }
      
      const total = customer.Orders
        .filter(order => order.status === 'Completed')
        .reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
      
      return total.toFixed(2);
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    onMounted(() => {
      fetchCustomers();
    });
    
    return {
      customers,
      loading,
      searchQuery,
      filteredCustomers,
      calculateTotalSpent,
      formatDate
    };
  }
};
</script>

<style scoped>
.customers {
  padding: 20px;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-header h1 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4A90E2;
}

.customers-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  color: #5a6c7d;
  margin: 0;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.customer-card {
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 25px;
  transition: box-shadow 0.3s;
}

.customer-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.customer-info h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.customer-info p {
  color: #5a6c7d;
  margin: 5px 0;
  font-size: 14px;
}

.customer-status {
  text-align: right;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.customer-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #F8FAFB;
  border-radius: 8px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  color: #5a6c7d;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.customer-orders h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.no-orders {
  color: #5a6c7d;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #F8FAFB;
  border-radius: 6px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #F8FAFB;
  border-radius: 6px;
  font-size: 14px;
}

.order-id {
  font-weight: 600;
  color: #2c3e50;
}

.order-price {
  font-weight: 600;
  color: #4A90E2;
}

.view-more {
  text-align: center;
}

.view-all-link {
  color: #4A90E2;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.view-all-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }
  
  .search-input {
    width: 100%;
    max-width: 300px;
  }
  
  .customers-grid {
    grid-template-columns: 1fr;
  }
  
  .customer-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .customer-status {
    text-align: left;
  }
  
  .customer-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat {
    display: flex;
    justify-content: space-between;
    text-align: left;
  }
  
  .stat-label,
  .stat-value {
    display: inline;
  }
}
</style>

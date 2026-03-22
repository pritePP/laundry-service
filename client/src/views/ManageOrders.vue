<template>
  <div class="manage-orders">
    <div class="page-header">
      <h1>Manage Orders</h1>
      <div class="header-actions">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Ready">Ready</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div class="orders-container">
      <div v-if="loading" class="loading">Loading orders...</div>
      
      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <h3>No Orders Found</h3>
        <p>{{ statusFilter ? `No ${statusFilter} orders found.` : 'No orders have been placed yet.' }}</p>
      </div>
      
      <div v-else class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #{{ order.id }}</h3>
              <p><strong>Customer:</strong> {{ order.User?.name }} ({{ order.User?.email }})</p>
              <p><strong>Date:</strong> {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status-section">
              <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
              <p class="order-total"><strong>Total:</strong> ฿{{ order.totalPrice }}</p>
            </div>
          </div>
          
          <div class="order-items">
            <h4>Items:</h4>
            <div class="items-grid">
              <div v-for="detail in order.OrderDetails" :key="detail.id" class="item">
                <span class="item-name">{{ detail.Service.name }}</span>
                <span class="item-quantity">x{{ detail.quantity }}</span>
                <span class="item-price">฿{{ (detail.Service.price * detail.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="order-actions">
            <div class="status-update">
              <label :for="'status-' + order.id">Update Status:</label>
              <select 
                :id="'status-' + order.id" 
                v-model="order.newStatus" 
                @change="updateOrderStatus(order.id, order.newStatus)"
                class="status-select"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div class="action-buttons">
              <button 
                v-if="order.status === 'Pending'" 
                @click="updateOrderStatus(order.id, 'Processing')"
                class="btn btn-primary btn-sm"
              >
                Start Processing
              </button>
              <button 
                v-if="order.status === 'Processing'" 
                @click="updateOrderStatus(order.id, 'Ready')"
                class="btn btn-primary btn-sm"
              >
                Mark as Ready
              </button>
              <button 
                v-if="order.status === 'Ready'" 
                @click="updateOrderStatus(order.id, 'Completed')"
                class="btn btn-success btn-sm"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { orderService } from '../services/orderService';

export default {
  name: 'ManageOrders',
  setup() {
    const orders = ref([]);
    const loading = ref(false);
    const statusFilter = ref('');
    
    const filteredOrders = computed(() => {
      if (!statusFilter.value) {
        return orders.value;
      }
      return orders.value.filter(order => order.status === statusFilter.value);
    });
    
    const fetchOrders = async () => {
      loading.value = true;
      try {
        orders.value = await orderService.getAllOrders();
        // Initialize newStatus for each order
        orders.value.forEach(order => {
          order.newStatus = order.status;
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const updateOrderStatus = async (orderId, newStatus) => {
      if (!newStatus) return;
      
      try {
        await orderService.updateOrderStatus(orderId, newStatus);
        await fetchOrders(); // Refresh the list
        
        // Show success message if order is completed
        if (newStatus === 'Completed') {
          const successMessage = document.createElement('div');
          successMessage.className = 'success-message';
          successMessage.textContent = '✅ Order completed! Revenue updated in dashboard.';
          successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
          `;
          document.body.appendChild(successMessage);
          
          setTimeout(() => {
            successMessage.remove();
          }, 3000);
          
          // Trigger dashboard refresh by emitting a custom event
          window.dispatchEvent(new CustomEvent('orderCompleted', { 
            detail: { orderId, status: newStatus } 
          }));
        }
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    onMounted(() => {
      fetchOrders();
    });
    
    return {
      orders,
      loading,
      statusFilter,
      filteredOrders,
      updateOrderStatus,
      formatDate
    };
  }
};
</script>

<style scoped>
.manage-orders {
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

.filter-select, .status-select {
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-select:focus, .status-select:focus {
  outline: none;
  border-color: #4A90E2;
}

.orders-container {
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 25px;
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
}

.order-info h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.order-info p {
  color: #5a6c7d;
  margin: 5px 0;
  font-size: 14px;
}

.order-status-section {
  text-align: right;
}

.status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 10px;
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

.order-total {
  color: #2c3e50;
  font-size: 16px;
  margin: 0;
}

.order-items h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #F8FAFB;
  border-radius: 6px;
}

.item-name {
  font-weight: 500;
  color: #2c3e50;
}

.item-quantity {
  color: #5a6c7d;
  font-size: 14px;
}

.item-price {
  font-weight: 600;
  color: #4A90E2;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
  flex-wrap: wrap;
  gap: 15px;
}

.status-update {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-update label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #4A90E2;
  color: white;
}

.btn-primary:hover {
  background: #357ABD;
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

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }
  
  .order-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .order-status-section {
    text-align: left;
  }
  
  .order-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-update {
    justify-content: center;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>

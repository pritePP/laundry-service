<template>
  <div class="order-history-container">
    <div class="page-header">
      <h1>Order History</h1>
      <div class="header-actions">
        <router-link to="/create-order" class="btn btn-primary">Create New Order</router-link>
        <router-link to="/dashboard" class="btn btn-secondary">Dashboard</router-link>
      </div>
    </div>

    <div class="orders-container">
      <div v-if="loading" class="loading">Loading orders...</div>
      
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet. Start by creating your first order!</p>
        <router-link to="/create-order" class="btn btn-primary">Create Your First Order</router-link>
      </div>
      
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #{{ order.id }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
            <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
          </div>
          
          <div class="order-items">
            <h4>Items:</h4>
            <div class="items-list">
              <div v-for="detail in order.OrderDetails" :key="detail.id" class="item">
                <span class="item-name">{{ detail.Service.name }}</span>
                <span class="item-quantity">x{{ detail.quantity }}</span>
                <span class="item-price">฿{{ (detail.Service.price * detail.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              <strong>Total: ฿{{ order.totalPrice }}</strong>
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'Pending'" 
                @click="cancelOrder(order.id)"
                class="btn btn-danger btn-sm"
              >
                Cancel Order
              </button>
              <span v-else-if="order.status === 'Cancelled'" class="cancelled-text">
                Order Cancelled
              </span>
              <span v-else-if="order.status === 'Completed'" class="completed-text">
                ✓ Completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderService } from '../services/orderService';

export default {
  name: 'OrderHistory',
  setup() {
    const router = useRouter();
    
    const orders = ref([]);
    const loading = ref(false);
    
    const fetchOrders = async () => {
      loading.value = true;
      try {
        orders.value = await orderService.getUserOrders();
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
        await fetchOrders(); // Refresh the list
      } catch (error) {
        console.error('Failed to cancel order:', error);
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
      cancelOrder,
      formatDate
    };
  }
};
</script>

<style scoped>
.order-history-container {
  min-height: 100vh;
  background: #F8FAFB;
  padding: 20px;
  width: 100%;
  max-width: 100%;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
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

.btn-primary {
  background: #4A90E2;
  color: white;
}

.btn-primary:hover {
  background: #357ABD;
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

.orders-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 60px;
  color: #5a6c7d;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.empty-state p {
  color: #5a6c7d;
  margin-bottom: 30px;
  font-size: 16px;
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
}

.order-info h3 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1.3rem;
}

.order-date {
  color: #5a6c7d;
  font-size: 14px;
  margin: 0;
}

.status {
  padding: 6px 16px;
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

.order-items h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
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

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.order-total {
  font-size: 18px;
  color: #2c3e50;
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cancelled-text {
  color: #dc3545;
  font-weight: 600;
}

.completed-text {
  color: #28a745;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .item {
    flex-direction: column;
    gap: 5px;
    text-align: center;
  }
}
</style>

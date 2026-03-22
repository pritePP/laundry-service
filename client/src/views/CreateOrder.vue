<template>
  <div class="create-order-container">
    <div class="order-header">
      <h1>Create New Order</h1>
      <router-link to="/dashboard" class="btn btn-secondary">Back to Dashboard</router-link>
    </div>

    <div class="order-content">
      <!-- Services Selection -->
      <div class="services-section">
        <h2>Select Services</h2>
        
        <div v-if="loadingServices" class="loading">Loading services...</div>
        
        <div v-else class="services-grid">
          <div 
            v-for="service in services" 
            :key="service.id"
            class="service-card"
            :class="{ selected: isServiceSelected(service.id) }"
            @click="toggleService(service)"
          >
            <div class="service-image">
              <img 
                v-if="service.image" 
                :src="serviceService.getImageUrl(service.image)" 
                :alt="service.name"
                @error="handleImageError"
              />
              <div v-else class="placeholder-image">
                🧼
              </div>
            </div>
            <div class="service-info">
              <h3>{{ service.name }}</h3>
              <p class="service-description">{{ service.description }}</p>
              <p class="service-price">{{ service.price }} บาท</p>
            </div>
            <div class="service-controls">
              <button 
                v-if="isServiceSelected(service.id)"
                @click.stop="removeService(service.id)"
                class="btn btn-danger btn-sm"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Order Summary</h2>
        
        <div v-if="selectedServices.length === 0" class="empty-summary">
          <p>No services selected. Please select services from the list above.</p>
        </div>
        
        <div v-else class="summary-content">
          <div class="selected-items">
            <div v-for="item in selectedServices" :key="item.serviceId" class="selected-item">
              <div class="item-info">
                <h4>{{ item.service.name }}</h4>
                <p>{{ item.service.price }} bath</p>
              </div>
              <div class="item-controls">
                <button @click="decreaseQuantity(item.serviceId)" class="quantity-btn">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item.serviceId)" class="quantity-btn">+</button>
              </div>
              <div class="item-total">
                {{ (item.service.price * item.quantity) }} bath
              </div>
            </div>
          </div>
          
          <div class="summary-total">
            <h3>Total: {{ totalPrice }} bath</h3>
          </div>
          
          <button 
            @click="createOrder" 
            :disabled="creatingOrder"
            class="btn btn-primary btn-full"
          >
            {{ creatingOrder ? 'Creating Order...' : 'Create Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { serviceService } from '../services/serviceService';
import { orderService } from '../services/orderService';

export default {
  name: 'CreateOrder',
  setup() {
    const router = useRouter();
    
    const services = ref([]);
    const selectedServices = ref([]);
    const loadingServices = ref(false);
    const creatingOrder = ref(false);
    
    const totalPrice = computed(() => {
      return selectedServices.value.reduce((total, item) => {
        return total + (item.service.price * item.quantity);
      }, 0);
    });
    
    const fetchServices = async () => {
      loadingServices.value = true;
      try {
        services.value = await serviceService.getServices();
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        loadingServices.value = false;
      }
    };
    
    const isServiceSelected = (serviceId) => {
      return selectedServices.value.some(item => item.serviceId === serviceId);
    };
    
    const toggleService = (service) => {
      if (isServiceSelected(service.id)) {
        removeService(service.id);
      } else {
        selectedServices.value.push({
          serviceId: service.id,
          service: service,
          quantity: 1
        });
      }
    };
    
    const removeService = (serviceId) => {
      selectedServices.value = selectedServices.value.filter(
        item => item.serviceId !== serviceId
      );
    };
    
    const increaseQuantity = (serviceId) => {
      const item = selectedServices.value.find(item => item.serviceId === serviceId);
      if (item) {
        item.quantity++;
      }
    };
    
    const decreaseQuantity = (serviceId) => {
      const item = selectedServices.value.find(item => item.serviceId === serviceId);
      if (item && item.quantity > 1) {
        item.quantity--;
      }
    };
    
    const createOrder = async () => {
      if (selectedServices.value.length === 0) return;
      
      creatingOrder.value = true;
      try {
        const orderData = {
          items: selectedServices.value.map(item => ({
            serviceId: item.serviceId,
            quantity: item.quantity
          }))
        };
        
        const order = await orderService.createOrder(orderData);
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to create order:', error);
      } finally {
        creatingOrder.value = false;
      }
    };
    
    const handleImageError = (event) => {
      event.target.style.display = 'none';
      event.target.nextElementSibling.style.display = 'flex';
    };
    
    onMounted(() => {
      fetchServices();
    });
    
    return {
      services,
      selectedServices,
      loadingServices,
      creatingOrder,
      totalPrice,
      isServiceSelected,
      toggleService,
      removeService,
      increaseQuantity,
      decreaseQuantity,
      createOrder,
      handleImageError,
      serviceService
    };
  }
};
</script>

<style scoped>
.create-order-container {
  min-height: 100vh;
  background: #F8FAFB;
  padding: 20px;
  width: 100%;
  max-width: 100%;
}

.order-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-header h1 {
  color: #2c3e50;
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

.btn-primary {
  background: #4A90E2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #357ABD;
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

.btn-full {
  width: 100%;
  padding: 15px;
  font-size: 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.order-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.services-section, .order-summary {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.services-section h2, .order-summary h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.service-card {
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  border-color: #4A90E2;
}

.service-card.selected {
  border-color: #4A90E2;
  background: #f0f8ff;
}

.service-image {
  width: 100%;
  height: 120px;
  margin-bottom: 15px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 3rem;
  color: #5a6c7d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.service-info h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.service-description {
  color: #5a6c7d;
  font-size: 14px;
  margin-bottom: 10px;
}

.service-price {
  color: #4A90E2;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.service-controls {
  margin-top: 15px;
  text-align: right;
}

.empty-summary {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.selected-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
}

.item-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.item-info p {
  color: #5a6c7d;
  margin: 0;
  font-size: 14px;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e1e8ed;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.item-total {
  font-weight: 700;
  color: #2c3e50;
  font-size: 16px;
}

.summary-total {
  padding-top: 20px;
  border-top: 2px solid #e1e8ed;
  text-align: right;
}

.summary-total h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
}

@media (max-width: 968px) {
  .order-content {
    grid-template-columns: 1fr;
  }
  
  .order-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .selected-item {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: center;
  }
}
</style>

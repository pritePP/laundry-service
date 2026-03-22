<template>
  <div class="manage-services">
    <div class="page-header">
      <h1>Manage Services</h1>
      <button @click="showAddModal = true" class="btn btn-primary">Add New Service</button>
    </div>

    <div class="services-container">
      <div v-if="loading" class="loading">Loading services...</div>
      
      <div v-else-if="services.length === 0" class="empty-state">
        <h3>No Services Found</h3>
        <p>Start by adding your first laundry service.</p>
        <button @click="showAddModal = true" class="btn btn-primary">Add First Service</button>
      </div>
      
      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.id" class="service-card">
          <div class="service-content">
            <h3>{{ service.name }}</h3>
            <p class="service-description">{{ service.description || 'No description available' }}</p>
            <p class="service-price">฿{{ service.price }}</p>
          </div>
          <div class="service-actions">
            <button @click="editService(service)" class="btn btn-secondary btn-sm">Edit</button>
            <button @click="deleteService(service.id)" class="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Service Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingService ? 'Edit Service' : 'Add New Service' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        
        <form @submit.prevent="saveService" class="modal-form">
          <div class="form-group">
            <label for="serviceName">Service Name</label>
            <input
              type="text"
              id="serviceName"
              v-model="serviceForm.name"
              required
              placeholder="e.g., Regular Wash"
            />
          </div>
          
          <div class="form-group">
            <label for="servicePrice">Price</label>
            <input
              type="number"
              id="servicePrice"
              v-model="serviceForm.price"
              step="0.01"
              min="0"
              required
              placeholder="e.g., 5.99"
            />
          </div>
          
          <div class="form-group">
            <label for="serviceDescription">Description</label>
            <textarea
              id="serviceDescription"
              v-model="serviceForm.description"
              rows="3"
              placeholder="Describe the service..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="serviceImage">Service Image</label>
            <input
              type="file"
              id="serviceImage"
              @change="handleImageChange"
              accept="image/*"
            />
            <small>Optional: Upload an image for this service</small>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { serviceService } from '../services/serviceService';

export default {
  name: 'ManageServices',
  setup() {
    const services = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editingService = ref(null);
    
    const serviceForm = ref({
      name: '',
      price: '',
      description: ''
    });
    
    const selectedImage = ref(null);
    
    const handleImageChange = (event) => {
      selectedImage.value = event.target.files[0];
    };
    
    const fetchServices = async () => {
      loading.value = true;
      try {
        services.value = await serviceService.getServices();
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const editService = (service) => {
      editingService.value = service;
      serviceForm.value = {
        name: service.name,
        price: service.price,
        description: service.description || ''
      };
      showEditModal.value = true;
    };
    
    const deleteService = async (serviceId) => {
      if (!confirm('Are you sure you want to delete this service?')) return;
      
      try {
        await serviceService.deleteService(serviceId);
        await fetchServices(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    };
    
    const saveService = async () => {
      saving.value = true;
      try {
        if (editingService.value) {
          await serviceService.updateService(editingService.value.id, serviceForm.value, selectedImage.value);
        } else {
          await serviceService.createService(serviceForm.value, selectedImage.value);
        }
        await fetchServices(); // Refresh the list
        closeModal();
      } catch (error) {
        console.error('Failed to save service:', error);
      } finally {
        saving.value = false;
      }
    };
    
    const closeModal = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      editingService.value = null;
      serviceForm.value = {
        name: '',
        price: '',
        description: ''
      };
      selectedImage.value = null;
    };
    
    onMounted(() => {
      fetchServices();
    });
    
    return {
      services,
      loading,
      saving,
      showAddModal,
      showEditModal,
      editingService,
      serviceForm,
      selectedImage,
      editService,
      deleteService,
      saveService,
      closeModal,
      handleImageChange
    };
  }
};
</script>

<style scoped>
.manage-services {
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
}

.page-header h1 {
  color: #2c3e50;
  margin: 0;
}

.services-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
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
  margin-bottom: 20px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.service-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.service-content h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.service-description {
  color: #5a6c7d;
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.5;
}

.service-price {
  color: #4A90E2;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.service-actions {
  display: flex;
  gap: 10px;
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

.btn-primary:hover:not(:disabled) {
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #5a6c7d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #2c3e50;
}

.modal-form {
  padding: 30px;
}

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
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4A90E2;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-form {
    padding: 20px;
  }
}
</style>

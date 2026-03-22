import api from './api';

export const serviceService = {
  // Get all services
  async getServices() {
    const response = await api.get('/services');
    return response.data;
  },

  // Get service by ID
  async getServiceById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Create service (admin)
  async createService(serviceData, imageFile) {
    const formData = new FormData();
    formData.append('name', serviceData.name);
    formData.append('price', serviceData.price);
    formData.append('description', serviceData.description || '');
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update service (admin)
  async updateService(id, serviceData, imageFile) {
    const formData = new FormData();
    formData.append('name', serviceData.name);
    formData.append('price', serviceData.price);
    formData.append('description', serviceData.description || '');
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.put(`/services/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete service (admin)
  async deleteService(id) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // Get service image URL
  getImageUrl(imageName) {
    if (!imageName) return null;
    return `http://localhost:5000/uploads/${imageName}`;
  }
};

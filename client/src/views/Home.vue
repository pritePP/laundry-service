<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Fresh & Clean Laundry Service</h1>
        <p>Professional laundry service at your fingertips. Quick, reliable, and affordable.</p>
        <div class="hero-buttons">
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/register" class="btn btn-primary">Get Started</router-link>
            <router-link to="/login" class="btn btn-secondary">Sign In</router-link>
          </template>
          <template v-else>
            <router-link to="/dashboard" class="btn btn-primary">Go to Dashboard</router-link>
          </template>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>Why Choose Us?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🧼</div>
            <h3>Quality Service</h3>
            <p>Professional cleaning with attention to detail</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Fast Turnaround</h3>
            <p>Quick service to get your clothes back fast</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Affordable Prices</h3>
            <p>Competitive pricing for all laundry services</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Easy Tracking</h3>
            <p>Track your orders in real-time</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-preview">
      <div class="container">
        <h2>Our Services</h2>
        <div class="services-grid">
          <div class="service-card">
            <h3>ซักผ้าปกติ</h3>
            <p class="price">50 บาท</p>
            <p>บริการซักผ้าสำหรับเสื้อผ้าใช้ในชีวิตประจำวัน</p>
          </div>
          <div class="service-card">
            <h3>ซักแห้ง</h3>
            <p class="price">150 บาท</p>
            <p>บริการซักแห้งสำหรับเสื้อผ้าที่ต้องการการดูแลเป็นพิเศษ</p>
          </div>
          <div class="service-card">
            <h3>รีดผ้า</h3>
            <p class="price">40 บาท</p>
            <p>บริการรีดผ้าให้เรียบเป็นพิเศษ</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';

export default {
  name: 'Home',
  setup() {
    const authStore = useAuthStore();
    
    return {
      authStore
    };
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
}

.hero {
  background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #F0F8FF 100%);
  min-height: 60vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
}

.hero-content h1 {
  font-size: 3.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-content p {
  font-size: 1.2rem;
  color: #5a6c7d;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #4A90E2;
  border: 2px solid #4A90E2;
}

.btn-secondary:hover {
  background: #4A90E2;
  color: white;
}

.features, .services-preview {
  padding: 80px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features h2, .services-preview h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 50px;
}

.features-grid, .services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card, .service-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover, .service-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3, .service-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.feature-card p, .service-card p {
  color: #5a6c7d;
  line-height: 1.6;
}

.service-card .price {
  font-size: 1.8rem;
  color: #4A90E2;
  font-weight: 700;
  margin: 10px 0;
}

.services-preview {
  background: #F8FAFB;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .features h2, .services-preview h2 {
    font-size: 2rem;
  }
}
</style>

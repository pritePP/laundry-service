<template>
  <div class="revenue">
    <div class="page-header">
      <h1>Revenue Report</h1>
      <div class="header-actions">
        <select v-model="timeFilter" @change="fetchRevenueData" class="filter-select">
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
          <option value="today">Today</option>
        </select>
        <button @click="exportReport" class="btn btn-secondary">Export Report</button>
      </div>
    </div>

    <div class="revenue-content">
      <!-- Revenue Summary -->
      <div class="revenue-summary">
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <h3>฿{{ revenueData.totalRevenue }}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">📋</div>
            <div class="card-content">
              <h3>{{ revenueData.totalOrders }}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <h3>฿{{ averageOrderValue }}</h3>
              <p>Average Order Value</p>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <h3>{{ completionRate }}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Charts -->
      <div class="charts-section">
        <div class="chart-card">
          <h2>Revenue Trend</h2>
          <div class="chart-placeholder">
            <div class="mock-chart">
              <div class="chart-bars">
                <div v-for="(bar, index) in mockChartData" :key="index" class="bar" :style="{ height: bar.height + '%' }">
                  <span class="bar-label">{{ bar.label }}</span>
                  <span class="bar-value">฿{{ bar.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-card">
          <h2>Order Status Distribution</h2>
          <div class="status-distribution">
            <div v-for="status in orderStatusDistribution" :key="status.name" class="status-item">
              <div class="status-info">
                <span :class="['status-dot', status.name.toLowerCase()]"></span>
                <span class="status-name">{{ status.name }}</span>
              </div>
              <div class="status-stats">
                <span class="status-count">{{ status.count }}</span>
                <span class="status-percentage">{{ status.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Services -->
      <div class="top-services">
        <h2>Top Services</h2>
        <div v-if="loadingServices" class="loading">Loading services data...</div>
        <div v-else class="services-list">
          <div v-for="service in topServices" :key="service.id" class="service-item">
            <div class="service-info">
              <h4>{{ service.name }}</h4>
              <p>{{ service.description }}</p>
            </div>
            <div class="service-stats">
              <span class="service-orders">{{ service.orderCount }} orders</span>
              <span class="service-revenue">฿{{ service.revenue }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="recent-transactions">
        <h2>Recent Completed Orders</h2>
        <div v-if="loadingOrders" class="loading">Loading orders...</div>
        <div v-else class="transactions-list">
          <div v-for="order in recentOrders" :key="order.id" class="transaction-item">
            <div class="transaction-info">
              <h4>Order #{{ order.id }}</h4>
              <p>{{ order.User?.name }} - {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="transaction-amount">
              <span class="amount">฿{{ order.totalPrice }}</span>
              <span class="items-count">{{ order.OrderDetails?.length || 0 }} items</span>
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
import { serviceService } from '../services/serviceService';

export default {
  name: 'Revenue',
  setup() {
    const revenueData = ref({
      totalRevenue: '0.00',
      totalOrders: 0
    });
    
    const allOrders = ref([]);
    const services = ref([]);
    const loadingOrders = ref(false);
    const loadingServices = ref(false);
    const timeFilter = ref('all');
    
    // Mock chart data
    const mockChartData = ref([
      { label: 'Mon', value: 450, height: 60 },
      { label: 'Tue', value: 320, height: 45 },
      { label: 'Wed', value: 580, height: 75 },
      { label: 'Thu', value: 420, height: 55 },
      { label: 'Fri', value: 680, height: 85 },
      { label: 'Sat', value: 520, height: 65 },
      { label: 'Sun', value: 380, height: 50 }
    ]);
    
    const averageOrderValue = computed(() => {
      if (revenueData.value.totalOrders === 0) return '0.00';
      const avg = parseFloat(revenueData.value.totalRevenue) / revenueData.value.totalOrders;
      return avg.toFixed(2);
    });
    
    const completionRate = computed(() => {
      if (allOrders.value.length === 0) return 0;
      const completed = allOrders.value.filter(order => order.status === 'Completed').length;
      return Math.round((completed / allOrders.value.length) * 100);
    });
    
    const orderStatusDistribution = computed(() => {
      const statusCounts = {
        Pending: 0,
        Processing: 0,
        Ready: 0,
        Completed: 0,
        Cancelled: 0
      };
      
      allOrders.value.forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
          statusCounts[order.status]++;
        }
      });
      
      const total = allOrders.value.length;
      return Object.entries(statusCounts).map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));
    });
    
    const topServices = computed(() => {
      const serviceStats = {};
      
      allOrders.value.forEach(order => {
        if (order.OrderDetails && order.status === 'Completed') {
          order.OrderDetails.forEach(detail => {
            const serviceId = detail.serviceId;
            if (!serviceStats[serviceId]) {
              const service = services.value.find(s => s.id === serviceId);
              serviceStats[serviceId] = {
                id: serviceId,
                name: service?.name || 'Unknown Service',
                description: service?.description || '',
                orderCount: 0,
                revenue: 0
              };
            }
            serviceStats[serviceId].orderCount += detail.quantity;
            serviceStats[serviceId].revenue += detail.Service.price * detail.quantity;
          });
        }
      });
      
      return Object.values(serviceStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(service => ({
          ...service,
          revenue: service.revenue.toFixed(2)
        }));
    });
    
    const recentOrders = computed(() => {
      return allOrders.value
        .filter(order => order.status === 'Completed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    });
    
    const fetchRevenueData = async () => {
      try {
        const data = await orderService.getRevenueReport();
        revenueData.value = data;
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      }
    };
    
    const fetchOrders = async () => {
      loadingOrders.value = true;
      try {
        allOrders.value = await orderService.getAllOrders();
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        loadingOrders.value = false;
      }
    };
    
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
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    const exportReport = () => {
      // Create CSV content
      const csvContent = [
        ['Order ID', 'Customer', 'Date', 'Status', 'Total'],
        ...allOrders.value.map(order => [
          order.id,
          order.User?.name || 'Unknown',
          formatDate(order.createdAt),
          order.status,
          order.totalPrice
        ])
      ].map(row => row.join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    };
    
    onMounted(() => {
      fetchRevenueData();
      fetchOrders();
      fetchServices();
    });
    
    return {
      revenueData,
      allOrders,
      loadingOrders,
      loadingServices,
      timeFilter,
      mockChartData,
      averageOrderValue,
      completionRate,
      orderStatusDistribution,
      topServices,
      recentOrders,
      fetchRevenueData,
      formatDate,
      exportReport
    };
  }
};
</script>

<style scoped>
.revenue {
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

.filter-select {
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #4A90E2;
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

.revenue-summary {
  margin-bottom: 30px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  font-size: 2.5rem;
  min-width: 50px;
  text-align: center;
}

.card-content h3 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 2rem;
}

.card-content p {
  color: #5a6c7d;
  margin: 0;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-card h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.mock-chart {
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  align-items: flex-end;
}

.bar {
  width: 60px;
  background: #4A90E2;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 10px;
  min-height: 20px;
}

.bar-label {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.bar-value {
  color: white;
  font-size: 10px;
  margin-top: 5px;
}

.status-distribution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #F8FAFB;
  border-radius: 6px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.pending { background: #fff3cd; }
.status-dot.processing { background: #cce5ff; }
.status-dot.ready { background: #d4edda; }
.status-dot.completed { background: #d1ecf1; }
.status-dot.cancelled { background: #f8d7da; }

.status-name {
  font-weight: 500;
  color: #2c3e50;
}

.status-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.status-count {
  font-weight: 600;
  color: #2c3e50;
}

.status-percentage {
  color: #5a6c7d;
  font-size: 14px;
}

.top-services, .recent-transactions {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.top-services h2, .recent-transactions h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5a6c7d;
}

.services-list, .transactions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-item, .transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
}

.service-info h4, .transaction-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.service-info p, .transaction-info p {
  color: #5a6c7d;
  margin: 0;
  font-size: 14px;
}

.service-stats, .transaction-amount {
  text-align: right;
}

.service-orders, .items-count {
  display: block;
  color: #5a6c7d;
  font-size: 14px;
  margin-bottom: 5px;
}

.service-revenue, .amount {
  font-weight: 600;
  color: #4A90E2;
  font-size: 16px;
}

@media (max-width: 968px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    flex-direction: column;
    text-align: center;
  }
  
  .chart-bars {
    gap: 5px;
  }
  
  .bar {
    width: 40px;
  }
  
  .service-item, .transaction-item {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .service-stats, .transaction-amount {
    text-align: center;
  }
}
</style>

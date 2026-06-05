import api from './axios'

export const authAPI = {
  login: (data) => api.post('/auth/login', data)
}

export const adminAPI = {
  addDistributor: (data) => api.post('/admin/distributors', data),
  getDistributors: (page = 0) => api.get(`/admin/distributors?page=${page}`),
  updateStatus: (id, status) => api.patch(`/admin/distributors/${id}/status`, { status }),
  resetPassword: (id, password) => api.patch(`/admin/distributors/${id}/reset-password`, { password })
}

export const distributorAPI = {
  getDashboard: () => api.get('/distributor/dashboard'),
  // Delivery Boys
  addDeliveryBoy: (data) => api.post('/distributor/delivery-boys', data),
  getDeliveryBoys: () => api.get('/distributor/delivery-boys'),
  updateDeliveryBoy: (id, data) => api.put(`/distributor/delivery-boys/${id}`, data),
  deleteDeliveryBoy: (id) => api.delete(`/distributor/delivery-boys/${id}`),
  // Customers
  addCustomer: (data) => api.post('/distributor/customers', data),
  getCustomers: (search = '', page = 0) => api.get(`/distributor/customers?search=${search}&page=${page}`),
  updateCustomer: (id, data) => api.put(`/distributor/customers/${id}`, data),
  getCustomerHistory: (id, month, year) => api.get(`/distributor/customers/${id}/history?month=${month}&year=${year}`),
  // Milk Prices
  getMilkPrices: () => api.get('/distributor/milk-prices'),
  updateMilkPrice: (data) => api.post('/distributor/milk-prices', data),
  // Reports
  getDailyChart: (month, year) => api.get(`/distributor/reports/daily-chart?month=${month}&year=${year}`),
  getMonthlyTrend: (year) => api.get(`/distributor/reports/monthly-trend?year=${year}`),
  getDeliveryBoyPerformance: (month, year) => api.get(`/distributor/reports/delivery-boy-performance?month=${month}&year=${year}`)
}

export const deliveryAPI = {
  saveDelivery: (data) => api.post('/delivery', data),
  getDeliveriesForDate: (date) => api.get(`/delivery/date/${date}`),
  getMyCustomers: () => api.get('/delivery/my-customers'),
  addMyCustomer: (data) => api.post('/delivery/my-customers', data),
  getCustomerDeliveries: (customerId, start, end) =>
    api.get(`/delivery/customer/${customerId}?start=${start}&end=${end}`)
}

export const billingAPI = {
  generateBills: (month, year) => api.post(`/billing/generate?month=${month}&year=${year}`),
  getBills: (month, year) => api.get(`/billing?month=${month}&year=${year}`),
  recordPayment: (data) => api.post('/billing/payment', data)
}

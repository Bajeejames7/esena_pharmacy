import axios from 'axios';

/**
 * API service with authentication interceptors
 * Implements Requirements 11.10
 */

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && token !== 'mock-jwt-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  },
  
  validateToken: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  }
};

// Products API methods
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/products', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 } : {});
  },
  update: (id, data) => {
    const isFormData = data instanceof FormData;
    return api.put(`/products/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 } : {});
  },
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API methods
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}/details`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updateShipping: (id, shippingCost) =>
    api.put(`/orders/${id}/shipping`, { shipping_cost: shippingCost }),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  cancelByToken: (token, reason) => api.post(`/orders/cancel/${token}`, { reason }),
  getByToken: (token) => api.get(`/orders/${token}`),
};

// Appointments API methods
export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByToken: (token) => api.get(`/appointments/${token}`),
  getAvailability: (date) => api.get(`/appointments/availability?date=${date}`),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  reschedule: (id, date, time) => api.put(`/appointments/${id}/reschedule`, { date, time }),
};

// Statistics API methods
export const statsAPI = {
  getDashboard: () => api.get('/admin/dashboard/stats'),
};

// Blogs API methods
export const blogsAPI = {
  // Public methods
  getPublished: () => api.get('/blogs/published'),
  getBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  
  // Admin methods
  getAll: () => api.get('/blogs'),
  getById: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
  toggleStatus: (id) => api.patch(`/blogs/${id}/toggle-status`),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/blogs/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
  },
};

// Prescriptions API methods
export const prescriptionsAPI = {
  upload: (formData) => api.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/prescriptions'),
  updateStatus: (id, status) => api.patch(`/prescriptions/${id}/status`, { status }),
  createOrder: (id, data) => api.post(`/prescriptions/${id}/create-order`, data),
};

export default api;
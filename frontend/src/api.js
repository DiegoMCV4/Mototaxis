// =============================================
// API Utility con JWT Authentication
// Todas las peticiones pasan por aquí
// =============================================
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== INTERCEPTOR REQUEST ====================
// Agrega automáticamente el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== INTERCEPTOR RESPONSE ====================
// Maneja errores de autenticación automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expirado o inválido — limpiar sesión
      const isLoginRoute = error.config?.url?.includes('/api/auth/login');
      const isRegisterRoute = error.config?.url?.includes('/api/auth/register');

      if (!isLoginRoute && !isRegisterRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  register: (email, password, fullName, userType, phone) =>
    api.post('/api/auth/register', { email, password, fullName, userType, phone }),

  verify: () =>
    api.get('/api/auth/verify'),

  getProfile: (userId) =>
    api.get(`/api/user/${userId}`),

  updateProfile: (userId, data) =>
    api.put(`/api/user/${userId}`, data),
};

// ==================== RIDES ====================
export const ridesAPI = {
  request: (data) =>
    api.post('/api/rides/request', data),

  accept: (rideId, driverId) =>
    api.post(`/api/rides/${rideId}/accept`, { driverId }),

  start: (rideId) =>
    api.post(`/api/rides/${rideId}/start`),

  complete: (rideId, data) =>
    api.post(`/api/rides/${rideId}/complete`, data),

  cancel: (rideId) =>
    api.post(`/api/rides/${rideId}/cancel`),

  getActive: (userId) =>
    api.get(`/api/rides/active/${userId}`),

  getHistory: (userId) =>
    api.get(`/api/rides/history/${userId}`),

  getAvailable: () =>
    api.get('/api/rides/available'),
};

// ==================== RATINGS ====================
export const ratingsAPI = {
  create: (data) =>
    api.post('/api/ratings', data),

  getByUser: (userId) =>
    api.get(`/api/ratings/${userId}`),

  getAverage: (userId) =>
    api.get(`/api/ratings/average/${userId}`),
};

// ==================== PAYMENTS ====================
export const paymentsAPI = {
  addMethod: (data) =>
    api.post('/api/payments/methods', data),

  getMethods: (userId) =>
    api.get(`/api/payments/methods/${userId}`),

  deleteMethod: (methodId) =>
    api.delete(`/api/payments/methods/${methodId}`),

  charge: (data) =>
    api.post('/api/payments/charge', data),

  topUp: (userId, amount) =>
    api.post('/api/payments/topup', { userId, amount }),

  getTransactions: (userId) =>
    api.get(`/api/payments/transactions/${userId}`),

  getWallet: (userId) =>
    api.get(`/api/payments/wallet/${userId}`),
};

// ==================== TRACKING ====================
export const trackingAPI = {
  saveLocation: (data) =>
    api.post('/api/tracking/location', data),

  getNearbyDrivers: (lat, lng, radius) =>
    api.get('/api/tracking/drivers/nearby', { params: { lat, lng, radius } }),

  getMessages: (rideId) =>
    api.get(`/api/tracking/messages/${rideId}`),
};

export default api;

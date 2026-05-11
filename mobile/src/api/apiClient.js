import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reemplazar localhost por tu IP local (ej. 192.168.0.22) para que el teléfono pueda conectarse al backend
const API_URL = 'https://mrt.viewdns.net/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar JWT a las peticiones
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token for interceptor', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

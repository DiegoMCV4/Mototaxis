import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reemplazar localhost por tu IP local (ej. 192.168.0.22) para que el teléfono pueda conectarse al backend
const API_URL = 'https://mrt.viewdns.net/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000, // 8 segundos para fallar rápido si no hay conexión
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Interceptor para agregar el token JWT
apiClient.interceptors.request.use(
  async (config) => {
    // Si es login o registro, no buscamos el token (evita bloqueos de AsyncStorage)
    if (config.url.includes('/auth/')) {
      return config;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error accediendo a AsyncStorage', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

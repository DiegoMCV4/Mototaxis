import { io } from 'socket.io-client';

// Conectar al API Gateway que proxea WebSockets al Tracking Service
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  timeout: 30000
});

// Eventos para conductores
export const emitDriverLocation = (driverId, latitude, longitude, rideId) => {
  socket.emit('driverLocation', { driverId, latitude, longitude, rideId });
};

// Eventos para chat
export const sendMessage = (rideId, senderId, message) => {
  socket.emit('message', { rideId, senderId, message });
};

// Emergencia
export const sendEmergencyCall = (userId, location) => {
  socket.emit('emergencyCall', { userId, location, timestamp: new Date() });
};

export default socket;

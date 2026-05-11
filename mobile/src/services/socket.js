import { io } from 'socket.io-client';

// IP local de la computadora donde corre el API Gateway (puerto 3000)
// Reemplazar si cambia la IP en la red local.
const API_URL = 'https://mrt.viewdns.net';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 30000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado al servidor WebSocket:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.log('❌ Error de conexión WebSocket:', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ Desconectado del servidor WebSocket:', reason);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Exportar una única instancia (Singleton)
const socketService = new SocketService();
export default socketService;

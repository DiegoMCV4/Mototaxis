// =============================================
// Microservicio 4: Tracking Service (Arquitectura Hexagonal)
// Ubicación en tiempo real, Chat, Emergencias
// Puerto: 3004 (HTTP + WebSocket)
// Bases de datos: MySQL (mensajes) + Redis (ubicaciones GPS) ✅ NoSQL
// =============================================
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Hexagonal Architecture Imports
const { pool: dbPool, redis } = require('./src/infrastructure/config/database');
const MySQLTrackingRepository = require('./src/infrastructure/adapters/repositories/MySQLTrackingRepository');
const TrackingUseCases = require('./src/application/use-cases/TrackingUseCases');
const TrackingController = require('./src/infrastructure/web/controllers/TrackingController');
const createTrackingRoutes = require('./src/infrastructure/web/routes/trackingRoutes');
const TrackingSocketHandler = require('./src/infrastructure/web/sockets/TrackingSocketHandler');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3004;

// Dependency Injection
const trackingRepository = new MySQLTrackingRepository(dbPool);
const trackingUseCases = new TrackingUseCases(trackingRepository);
const trackingController = new TrackingController(trackingUseCases);
const trackingRoutes = createTrackingRoutes(trackingController);
const socketHandler = new TrackingSocketHandler(io, trackingUseCases);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tracking-service', architecture: 'hexagonal' });
});

// Routes
app.use('/', trackingRoutes);

// Socket.io
io.on('connection', (socket) => socketHandler.handleConnection(socket));

server.listen(PORT, () => {
  console.log(`📍 Tracking Service (Hexagonal) corriendo en puerto ${PORT}`);
});

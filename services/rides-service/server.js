// =============================================
// Microservicio 2: Rides Service (Arquitectura Hexagonal)
// CRUD de viajes
// Puerto: 3002
// =============================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Hexagonal Architecture Imports
const dbPool = require('./src/infrastructure/config/database');
const MySQLRideRepository = require('./src/infrastructure/adapters/repositories/MySQLRideRepository');
const RideUseCases = require('./src/application/use-cases/RideUseCases');
const RideController = require('./src/infrastructure/web/controllers/RideController');
const createRideRoutes = require('./src/infrastructure/web/routes/rideRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Dependency Injection
const rideRepository = new MySQLRideRepository(dbPool);
const rideUseCases = new RideUseCases(rideRepository);
const rideController = new RideController(rideUseCases);
const rideRoutes = createRideRoutes(rideController);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rides-service', architecture: 'hexagonal' });
});

// Routes
app.use('/', rideRoutes);

app.listen(PORT, () => {
  console.log(`🚗 Rides Service (Hexagonal) corriendo en puerto ${PORT}`);
});

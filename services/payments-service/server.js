// =============================================
// Microservicio 5: Payments Service (Arquitectura Hexagonal)
// Métodos de pago, Wallet, Transacciones
// Puerto: 3005
// =============================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Hexagonal Architecture Imports
const dbPool = require('./src/infrastructure/config/database');
const MySQLPaymentRepository = require('./src/infrastructure/adapters/repositories/MySQLPaymentRepository');
const PaymentUseCases = require('./src/application/use-cases/PaymentUseCases');
const PaymentController = require('./src/infrastructure/web/controllers/PaymentController');
const createPaymentRoutes = require('./src/infrastructure/web/routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005;

// Dependency Injection
const paymentRepository = new MySQLPaymentRepository(dbPool);
const paymentUseCases = new PaymentUseCases(paymentRepository);
const paymentController = new PaymentController(paymentUseCases);
const paymentRoutes = createPaymentRoutes(paymentController);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payments-service', architecture: 'hexagonal' });
});

// Routes
app.use('/', paymentRoutes);

app.listen(PORT, () => {
  console.log(`💳 Payments Service (Hexagonal) corriendo en puerto ${PORT}`);
});

// =============================================
// Microservicio 3: Ratings Service (Arquitectura Hexagonal)
// Calificaciones y reseñas — Base de datos: MongoDB
// Puerto: 3003
// =============================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Hexagonal Architecture Imports
require('./src/infrastructure/config/database'); // Inicializa conexión MongoDB
const MongoRatingRepository = require('./src/infrastructure/adapters/repositories/MongoRatingRepository');
const RatingUseCases = require('./src/application/use-cases/RatingUseCases');
const RatingController = require('./src/infrastructure/web/controllers/RatingController');
const createRatingRoutes = require('./src/infrastructure/web/routes/ratingRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;

// Dependency Injection — MongoDB repository (Hexagonal Adapter)
const ratingRepository = new MongoRatingRepository();
const ratingUseCases = new RatingUseCases(ratingRepository);
const ratingController = new RatingController(ratingUseCases);
const ratingRoutes = createRatingRoutes(ratingController);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ratings-service', architecture: 'hexagonal' });
});

// Routes
app.use('/', ratingRoutes);

app.listen(PORT, () => {
  console.log(`⭐ Ratings Service (Hexagonal) corriendo en puerto ${PORT}`);
});

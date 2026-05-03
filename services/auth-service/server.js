// =============================================
// Microservicio 1: Auth Service (Hexagonal Architecture)
// Registro, Login, JWT, Perfil de usuario
// Puerto: 3001
// =============================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Imports de la Arquitectura Hexagonal
const dbPool = require('./src/infrastructure/config/database');
const MySQLUserRepository = require('./src/infrastructure/adapters/repositories/MySQLUserRepository');
const AuthUseCases = require('./src/application/use-cases/AuthUseCases');
const AuthController = require('./src/infrastructure/web/controllers/AuthController');
const createAuthRoutes = require('./src/infrastructure/web/routes/authRoutes');
const authenticateToken = require('./src/infrastructure/web/middlewares/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'mototaxi-secret-key-2024';
const PORT = process.env.PORT || 3001;

// ==================== INYECCIÓN DE DEPENDENCIAS ====================
// 1. Instanciar Repositorio (Capa Infraestructura)
const userRepository = new MySQLUserRepository(dbPool);

// 2. Instanciar Casos de Uso pasándole el Repositorio (Capa Aplicación)
const authUseCases = new AuthUseCases(userRepository, JWT_SECRET);

// 3. Instanciar Controlador pasándole los Casos de Uso (Capa Infraestructura - Web)
const authController = new AuthController(authUseCases);

// 4. Configurar Middleware
const authMiddleware = authenticateToken(JWT_SECRET);

// 5. Configurar Rutas
const authRoutes = createAuthRoutes(authController, authMiddleware);

// ==================== REGISTRO DE RUTAS ====================
// Health Check Global
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', architecture: 'hexagonal' });
});

// Usar las rutas. Nota: API Gateway redirige /api/auth/* hacia / y /api/user/* hacia /profile
app.use('/', authRoutes);

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🔐 Auth Service (Hexagonal) corriendo en puerto ${PORT}`);
});

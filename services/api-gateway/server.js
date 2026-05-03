// =============================================
// API Gateway
// Enrutador central para todos los microservicios
// Puerto: 3000
// =============================================
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { swaggerUi, swaggerSpecs } = require('./swagger');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 3000;

// URLs de los microservicios
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const RIDES_SERVICE = process.env.RIDES_SERVICE_URL || 'http://localhost:3002';
const RATINGS_SERVICE = process.env.RATINGS_SERVICE_URL || 'http://localhost:3003';
const TRACKING_SERVICE = process.env.TRACKING_SERVICE_URL || 'http://localhost:3004';
const PAYMENTS_SERVICE = process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3005';

// ==================== DOCUMENTACIÓN ====================
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date(),
    services: {
      auth: AUTH_SERVICE,
      rides: RIDES_SERVICE,
      ratings: RATINGS_SERVICE,
      tracking: TRACKING_SERVICE,
      payments: PAYMENTS_SERVICE
    }
  });
});

// ==================== PROXY ROUTES ====================

// Auth Service: /api/auth/* -> auth-service:3001/*
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
  onError: (err, req, res) => {
    console.error('❌ Auth Service error:', err.message);
    res.status(503).json({ error: 'Auth Service no disponible' });
  }
}));

// User profiles: /api/user/* -> auth-service:3001/profile/*
app.use('/api/user', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/user': '/profile' },
  onError: (err, req, res) => {
    console.error('❌ Auth Service error:', err.message);
    res.status(503).json({ error: 'Auth Service no disponible' });
  }
}));

// Rides Service: /api/rides/* -> rides-service:3002/*
app.use('/api/rides', createProxyMiddleware({
  target: RIDES_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/rides': '' },
  onError: (err, req, res) => {
    console.error('❌ Rides Service error:', err.message);
    res.status(503).json({ error: 'Rides Service no disponible' });
  }
}));

// Ratings Service: /api/ratings/* -> ratings-service:3003/*
app.use('/api/ratings', createProxyMiddleware({
  target: RATINGS_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/ratings': '' },
  onError: (err, req, res) => {
    console.error('❌ Ratings Service error:', err.message);
    res.status(503).json({ error: 'Ratings Service no disponible' });
  }
}));

// Tracking Service: /api/tracking/* -> tracking-service:3004/*
app.use('/api/tracking', createProxyMiddleware({
  target: TRACKING_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/tracking': '' },
  onError: (err, req, res) => {
    console.error('❌ Tracking Service error:', err.message);
    res.status(503).json({ error: 'Tracking Service no disponible' });
  }
}));

// Payments Service: /api/payments/* -> payments-service:3005/*
app.use('/api/payments', createProxyMiddleware({
  target: PAYMENTS_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '' },
  onError: (err, req, res) => {
    console.error('❌ Payments Service error:', err.message);
    res.status(503).json({ error: 'Payments Service no disponible' });
  }
}));

// Socket.io proxy para tracking
app.use('/socket.io', createProxyMiddleware({
  target: TRACKING_SERVICE,
  changeOrigin: true,
  ws: true,
  onError: (err, req, res) => {
    console.error('❌ Tracking WebSocket error:', err.message);
  }
}));

// ==================== 404 ====================
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    availableRoutes: [
      '/api/auth/*',
      '/api/user/*',
      '/api/rides/*',
      '/api/ratings/*',
      '/api/tracking/*',
      '/api/payments/*',
      '/health'
    ]
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🔀 API Gateway corriendo en puerto ${PORT}`);
  console.log(`   Auth Service:     ${AUTH_SERVICE}`);
  console.log(`   Rides Service:    ${RIDES_SERVICE}`);
  console.log(`   Ratings Service:  ${RATINGS_SERVICE}`);
  console.log(`   Tracking Service: ${TRACKING_SERVICE}`);
  console.log(`   Payments Service: ${PAYMENTS_SERVICE}`);
});

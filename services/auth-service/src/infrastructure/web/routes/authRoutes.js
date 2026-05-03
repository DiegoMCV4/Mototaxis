const express = require('express');

const createAuthRoutes = (authController, authMiddleware) => {
  const router = express.Router();

  // Health check local to this router (optional, but good practice)
  router.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service-hexagonal' }));

  // Public routes
  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));

  // Protected routes (Profile)
  router.get('/profile/:id', (req, res) => authController.getProfile(req, res));
  router.put('/profile/:id', (req, res) => authController.updateProfile(req, res));

  // Verify token
  router.get('/verify', authMiddleware, (req, res) => authController.verifyToken(req, res));

  return router;
};

module.exports = createAuthRoutes;

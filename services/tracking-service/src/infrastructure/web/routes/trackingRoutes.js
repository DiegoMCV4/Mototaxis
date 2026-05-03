const express = require('express');

const createTrackingRoutes = (trackingController) => {
  const router = express.Router();

  router.post('/location', (req, res) => trackingController.updateLocation(req, res));
  router.get('/drivers/nearby', (req, res) => trackingController.getNearbyDrivers(req, res));
  router.get('/messages/:rideId', (req, res) => trackingController.getMessages(req, res));

  return router;
};

module.exports = createTrackingRoutes;

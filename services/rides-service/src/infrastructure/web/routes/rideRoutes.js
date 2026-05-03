const express = require('express');

const createRideRoutes = (rideController) => {
  const router = express.Router();

  router.post('/request', (req, res) => rideController.requestRide(req, res));
  router.post('/:rideId/accept', (req, res) => rideController.acceptRide(req, res));
  router.post('/:rideId/start', (req, res) => rideController.startRide(req, res));
  router.post('/:rideId/complete', (req, res) => rideController.completeRide(req, res));
  router.post('/:rideId/cancel', (req, res) => rideController.cancelRide(req, res));
  router.get('/active/:userId', (req, res) => rideController.getActiveRides(req, res));
  router.get('/history/:userId', (req, res) => rideController.getHistory(req, res));
  router.get('/available', (req, res) => rideController.getAvailableRides(req, res));

  return router;
};

module.exports = createRideRoutes;

const express = require('express');

const createPaymentRoutes = (paymentController) => {
  const router = express.Router();

  router.post('/methods', (req, res) => paymentController.addMethod(req, res));
  router.get('/methods/:userId', (req, res) => paymentController.getMethods(req, res));
  router.delete('/methods/:methodId', (req, res) => paymentController.deleteMethod(req, res));
  router.post('/charge', (req, res) => paymentController.chargeRide(req, res));
  router.post('/topup', (req, res) => paymentController.topUp(req, res));
  router.get('/transactions/:userId', (req, res) => paymentController.getTransactions(req, res));
  router.get('/wallet/:userId', (req, res) => paymentController.getWalletBalance(req, res));

  return router;
};

module.exports = createPaymentRoutes;

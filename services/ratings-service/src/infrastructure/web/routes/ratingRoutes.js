const express = require('express');

const createRatingRoutes = (ratingController) => {
  const router = express.Router();

  router.post('/', (req, res) => ratingController.createRating(req, res));
  router.get('/:userId', (req, res) => ratingController.getUserRatings(req, res));
  router.get('/average/:userId', (req, res) => ratingController.getAverageScore(req, res));

  return router;
};

module.exports = createRatingRoutes;

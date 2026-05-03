class RatingController {
  constructor(ratingUseCases) {
    this.ratingUseCases = ratingUseCases;
  }

  async createRating(req, res) {
    try {
      const rating = await this.ratingUseCases.createRating(req.body);
      res.status(201).json({ success: true, rating });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserRatings(req, res) {
    try {
      const ratings = await this.ratingUseCases.getUserRatings(req.params.userId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAverageScore(req, res) {
    try {
      const result = await this.ratingUseCases.getAverageScore(req.params.userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RatingController;

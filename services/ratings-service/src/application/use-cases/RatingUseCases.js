const { v4: uuidv4 } = require('uuid');
const Rating = require('../../domain/models/Rating');

class RatingUseCases {
  constructor(ratingRepository) {
    this.ratingRepository = ratingRepository;
  }

  async createRating(data) {
    const { rideId, raterId, ratedId, score, comment } = data;
    if (!rideId || !raterId || !ratedId || !score) {
      throw new Error('Campos requeridos faltantes');
    }

    const ratingId = uuidv4();
    const newRating = new Rating({ id: ratingId, ...data });

    await this.ratingRepository.save(newRating);

    // Actualizar promedio del usuario calificado
    const average = await this.ratingRepository.getAverageScore(ratedId);
    await this.ratingRepository.updateUserRating(ratedId, average);

    return newRating;
  }

  async getUserRatings(userId) {
    return this.ratingRepository.findByUserId(userId);
  }

  async getAverageScore(userId) {
    const average = await this.ratingRepository.getAverageScore(userId);
    return { userId, average };
  }
}

module.exports = RatingUseCases;

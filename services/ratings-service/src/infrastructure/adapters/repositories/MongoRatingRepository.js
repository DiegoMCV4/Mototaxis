const mongoose = require('mongoose');

// ==================== MODELO MONGODB ====================
const ratingSchema = new mongoose.Schema({
  rideId:    { type: String, required: true, index: true },
  raterId:   { type: String, required: true, index: true },
  ratedId:   { type: String, required: true, index: true },
  score:     { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const RatingModel = mongoose.model('Rating', ratingSchema);

// ==================== REPOSITORIO MONGODB (Hexagonal Port) ====================
const RatingRepository = require('../../../domain/ports/RatingRepository');

class MongoRatingRepository extends RatingRepository {
  async save(rating) {
    const doc = await RatingModel.create({
      rideId:   rating.rideId,
      raterId:  rating.raterId,
      ratedId:  rating.ratedId,
      score:    rating.score,
      comment:  rating.comment
    });
    return { ...rating, id: doc._id.toString() };
  }

  async findByUserId(userId) {
    const docs = await RatingModel.find({ ratedId: userId }).sort({ createdAt: -1 });
    return docs.map(d => ({
      id:        d._id.toString(),
      rideId:    d.rideId,
      raterId:   d.raterId,
      ratedId:   d.ratedId,
      score:     d.score,
      comment:   d.comment,
      createdAt: d.createdAt
    }));
  }

  async getAverageScore(userId) {
    const result = await RatingModel.aggregate([
      { $match: { ratedId: userId } },
      { $group: { _id: '$ratedId', average: { $avg: '$score' } } }
    ]);
    return result.length > 0 ? parseFloat(result[0].average.toFixed(2)) : 5.0;
  }

  // MongoDB: no hay tabla users aquí — el promedio se comunica al auth-service
  // via eventos de dominio o API call (desacoplamiento entre microservicios)
  async updateUserRating(userId, average) {
    console.log(`📊 Rating promedio para ${userId}: ${average} (sincronizar con auth-service)`);
    return average;
  }
}

module.exports = MongoRatingRepository;

const RatingRepository = require('../../../domain/ports/RatingRepository');
const Rating = require('../../../domain/models/Rating');

class MySQLRatingRepository extends RatingRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  _mapToDomain(row) {
    if (!row) return null;
    return new Rating({
      id: row.id,
      rideId: row.ride_id,
      raterId: row.rater_id,
      ratedId: row.rated_id,
      score: row.score,
      comment: row.comment,
      createdAt: row.created_at
    });
  }

  async save(rating) {
    await this.db.query(
      'INSERT INTO ratings (id, ride_id, rater_id, rated_id, score, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [rating.id, rating.rideId, rating.raterId, rating.ratedId, rating.score, rating.comment]
    );
    return rating;
  }

  async findByUserId(userId) {
    const [rows] = await this.db.query(
      'SELECT r.*, u.full_name as rater_name FROM ratings r JOIN users u ON r.rater_id = u.id WHERE r.rated_id = ? ORDER BY r.created_at DESC',
      [userId]
    );
    return rows; // Retornamos los datos planos para el controlador
  }

  async getAverageScore(userId) {
    const [rows] = await this.db.query('SELECT AVG(score) as average FROM ratings WHERE rated_id = ?', [userId]);
    return parseFloat(rows[0].average) || 5.0;
  }

  async updateUserRating(userId, average) {
    await this.db.query('UPDATE users SET rating = ? WHERE id = ?', [average, userId]);
  }
}

module.exports = MySQLRatingRepository;

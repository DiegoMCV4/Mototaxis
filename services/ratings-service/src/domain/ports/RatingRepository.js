class RatingRepository {
  async save(rating) { throw new Error('Method not implemented'); }
  async findByUserId(userId) { throw new Error('Method not implemented'); }
  async getAverageScore(userId) { throw new Error('Method not implemented'); }
  async updateUserRating(userId, average) { throw new Error('Method not implemented'); }
}

module.exports = RatingRepository;

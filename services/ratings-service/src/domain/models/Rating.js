class Rating {
  constructor({ id, rideId, raterId, ratedId, score, comment, createdAt }) {
    this.id = id;
    this.rideId = rideId;
    this.raterId = raterId;
    this.ratedId = ratedId;
    this.score = score;
    this.comment = comment || null;
    this.createdAt = createdAt || new Date();
  }
}

module.exports = Rating;

class Transaction {
  constructor({ id, rideId, userId, amount, type, status, description, createdAt }) {
    this.id = id;
    this.rideId = rideId || null;
    this.userId = userId;
    this.amount = parseFloat(amount);
    this.type = type; // charge, topup, payment
    this.status = status || 'completed';
    this.description = description;
    this.createdAt = createdAt || new Date();
  }
}

module.exports = Transaction;

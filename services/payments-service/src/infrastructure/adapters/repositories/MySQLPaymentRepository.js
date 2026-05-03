const PaymentRepository = require('../../../domain/ports/PaymentRepository');
const PaymentMethod = require('../../../domain/models/PaymentMethod');
const Transaction = require('../../../domain/models/Transaction');

class MySQLPaymentRepository extends PaymentRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async saveMethod(method) {
    await this.db.query(
      'INSERT INTO payment_methods (id, user_id, type, card_brand, last_four, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [method.id, method.userId, method.type, method.cardBrand, method.lastFour, method.isDefault]
    );
    return method;
  }

  async findMethodsByUserId(userId) {
    const [rows] = await this.db.query(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return rows.map(r => new PaymentMethod(r));
  }

  async deleteMethod(methodId) {
    const [result] = await this.db.query('DELETE FROM payment_methods WHERE id = ?', [methodId]);
    return result.affectedRows > 0;
  }

  async clearDefaultMethod(userId) {
    await this.db.query('UPDATE payment_methods SET is_default = FALSE WHERE user_id = ?', [userId]);
  }

  async saveTransaction(transaction) {
    await this.db.query(
      'INSERT INTO transactions (id, ride_id, user_id, amount, type, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [transaction.id, transaction.rideId, transaction.userId, transaction.amount, transaction.type, transaction.status, transaction.description]
    );
    return transaction;
  }

  async findTransactionsByUserId(userId) {
    const [rows] = await this.db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return rows.map(r => new Transaction({
      id: r.id,
      rideId: r.ride_id,
      userId: r.user_id,
      amount: r.amount,
      type: r.type,
      status: r.status,
      description: r.description,
      createdAt: r.created_at
    }));
  }

  async updateWalletBalance(userId, amount) {
    await this.db.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, userId]);
  }

  async getWalletBalance(userId) {
    const [rows] = await this.db.query('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    return rows.length > 0 ? parseFloat(rows[0].wallet_balance) : null;
  }

  async findDriverByRideId(rideId) {
    const [rows] = await this.db.query('SELECT driver_id FROM rides WHERE id = ?', [rideId]);
    return rows.length > 0 ? rows[0].driver_id : null;
  }
}

module.exports = MySQLPaymentRepository;

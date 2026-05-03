const UserRepository = require('../../../domain/ports/UserRepository');
const User = require('../../../domain/models/User');

class MySQLUserRepository extends UserRepository {
  constructor(dbPool) {
    super();
    this.db = dbPool;
  }

  // Helper to map DB row to Domain User entity
  _mapToUser(row) {
    if (!row) return null;
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      fullName: row.full_name,
      userType: row.user_type,
      photo: row.photo,
      rating: parseFloat(row.rating),
      rides: row.rides,
      walletBalance: parseFloat(row.wallet_balance),
      phone: row.phone,
      createdAt: row.created_at
    });
  }

  async findByEmail(email) {
    const [rows] = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    return this._mapToUser(rows[0]);
  }

  async findById(id) {
    const [rows] = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    return this._mapToUser(rows[0]);
  }

  async save(user) {
    await this.db.query(
      `INSERT INTO users (id, email, password, full_name, user_type, photo, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.password, user.fullName, user.userType, user.photo, user.phone]
    );
    return user;
  }

  async update(id, updates) {
    const fields = [];
    const values = [];

    // Map domain fields to DB columns
    if (updates.fullName) { fields.push('full_name = ?'); values.push(updates.fullName); }
    if (updates.phone) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.photo) { fields.push('photo = ?'); values.push(updates.photo); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

module.exports = MySQLUserRepository;

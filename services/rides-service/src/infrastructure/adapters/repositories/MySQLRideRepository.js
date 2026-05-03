const RideRepository = require('../../../domain/ports/RideRepository');
const Ride = require('../../../domain/models/Ride');

class MySQLRideRepository extends RideRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  _mapToDomain(row) {
    if (!row) return null;
    return new Ride({
      id: row.id,
      passengerId: row.passenger_id,
      driverId: row.driver_id,
      status: row.status,
      pickupLocation: row.pickup_location,
      pickupLat: row.pickup_lat,
      pickupLng: row.pickup_lng,
      dropoffLocation: row.dropoff_location,
      dropoffLat: row.dropoff_lat,
      dropoffLng: row.dropoff_lng,
      paymentMethod: row.payment_method,
      estimatedPrice: parseFloat(row.estimated_price),
      actualPrice: row.actual_price ? parseFloat(row.actual_price) : null,
      distance: row.distance,
      duration: row.duration,
      startTime: row.start_time,
      endTime: row.end_time,
      createdAt: row.created_at,
      passengerName: row.passenger_name, // Extendido para available
      passengerRating: row.passenger_rating
    });
  }

  async save(ride) {
    await this.db.query(
      `INSERT INTO rides (id, passenger_id, pickup_location, pickup_lat, pickup_lng, dropoff_location, dropoff_lat, dropoff_lng, payment_method, estimated_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ride.id, ride.passengerId, ride.pickupLocation, ride.pickupLat || null, ride.pickupLng || null, ride.dropoffLocation, ride.dropoffLat || null, ride.dropoffLng || null, ride.paymentMethod || 'cash', ride.estimatedPrice || 0]
    );
    return ride;
  }

  async findById(id) {
    const [rows] = await this.db.query('SELECT * FROM rides WHERE id = ?', [id]);
    return this._mapToDomain(rows[0]);
  }

  async update(id, updates) {
    const fields = [];
    const values = [];

    const fieldMap = {
      status: 'status',
      driverId: 'driver_id',
      startTime: 'start_time',
      endTime: 'end_time',
      actualPrice: 'actual_price',
      distance: 'distance',
      duration: 'duration'
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    await this.db.query(`UPDATE rides SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async findActiveByUserId(userId) {
    const [rows] = await this.db.query(
      `SELECT * FROM rides WHERE (passenger_id = ? OR driver_id = ?) AND status IN ('searching', 'accepted', 'in_progress') ORDER BY created_at DESC`,
      [userId, userId]
    );
    return rows.map(this._mapToDomain);
  }

  async findHistoryByUserId(userId) {
    const [rows] = await this.db.query(
      `SELECT * FROM rides WHERE (passenger_id = ? OR driver_id = ?) AND status = 'completed' ORDER BY end_time DESC LIMIT 50`,
      [userId, userId]
    );
    return rows.map(this._mapToDomain);
  }

  async findAvailable() {
    const [rows] = await this.db.query(
      `SELECT r.*, u.full_name as passenger_name, u.rating as passenger_rating 
       FROM rides r 
       JOIN users u ON r.passenger_id = u.id 
       WHERE r.status = 'searching' 
       ORDER BY r.created_at DESC`
    );
    return rows.map(this._mapToDomain);
  }

  async incrementUserRides(userId) {
    await this.db.query('UPDATE users SET rides = rides + 1 WHERE id = ?', [userId]);
  }
}

module.exports = MySQLRideRepository;

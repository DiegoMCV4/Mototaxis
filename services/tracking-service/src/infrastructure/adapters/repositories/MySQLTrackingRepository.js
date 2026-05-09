const TrackingRepository = require('../../../domain/ports/TrackingRepository');
const Location = require('../../../domain/models/Location');
const Message = require('../../../domain/models/Message');

class MySQLTrackingRepository extends TrackingRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findLocationByDriverId(driverId) {
    const [rows] = await this.db.query('SELECT * FROM driver_locations WHERE driver_id = ?', [driverId]);
    return rows[0];
  }

  async saveLocation(location) {
    const existing = await this.findLocationByDriverId(location.driverId);
    if (existing) {
      await this.db.query(
        'UPDATE driver_locations SET latitude = ?, longitude = ?, is_online = ?, updated_at = NOW() WHERE driver_id = ?',
        [location.latitude, location.longitude, location.isOnline, location.driverId]
      );
    } else {
      await this.db.query(
        'INSERT INTO driver_locations (id, driver_id, latitude, longitude, is_online) VALUES (?, ?, ?, ?, ?)',
        [location.id, location.driverId, location.latitude, location.longitude, location.isOnline]
      );
    }
  }

  async findNearbyDrivers(lat, lng, radius) {
    const [drivers] = await this.db.query(
      `SELECT dl.*, u.full_name, u.photo, u.rating 
       FROM driver_locations dl
       JOIN users u ON dl.driver_id = u.id
       WHERE dl.is_online = TRUE
       AND u.user_type = 'driver'
       ORDER BY dl.updated_at DESC`
    );
    return drivers.map(d => ({
      driverId: d.driver_id,
      name: d.full_name,
      photo: d.photo,
      rating: d.rating,
      latitude: parseFloat(d.latitude),
      longitude: parseFloat(d.longitude),
      updatedAt: d.updated_at
    }));
  }

  async saveMessage(msg) {
    await this.db.query(
      'INSERT INTO messages (id, ride_id, sender_id, message) VALUES (?, ?, ?, ?)',
      [msg.id, msg.rideId, msg.senderId, msg.message]
    );
  }

  async findMessagesByRideId(rideId) {
    const [rows] = await this.db.query(
      `SELECT m.*, u.full_name as sender_name, u.photo as sender_photo
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ride_id = ?
       ORDER BY m.created_at ASC`,
      [rideId]
    );
    return rows.map(m => new Message({
      id: m.id,
      rideId: m.ride_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderPhoto: m.sender_photo,
      message: m.message,
      createdAt: m.created_at
    }));
  }

  async setDriverOffline(driverId) {
    await this.db.query('UPDATE driver_locations SET is_online = FALSE WHERE driver_id = ?', [driverId]);
  }

  async createRide(data) {
    const { rideId, passengerId, pickupLocation, pickupLat, pickupLng, dropoffLocation, dropoffLat, dropoffLng, estimatedPrice, status } = data;
    await this.db.query(
      `INSERT INTO rides (id, passenger_id, pickup_location, pickup_lat, pickup_lng, dropoff_location, dropoff_lat, dropoff_lng, estimated_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rideId, passengerId, pickupLocation, pickupLat, pickupLng, dropoffLocation, dropoffLat, dropoffLng, estimatedPrice, status || 'searching']
    );
  }

  async updateRideStatus(rideId, status) {
    await this.db.query(
      'UPDATE rides SET status = ? WHERE id = ?',
      [status, rideId]
    );
  }
}

module.exports = MySQLTrackingRepository;

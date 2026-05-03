class TrackingRepository {
  async saveLocation(location) { throw new Error('Method not implemented'); }
  async findLocationByDriverId(driverId) { throw new Error('Method not implemented'); }
  async findNearbyDrivers(lat, lng, radius) { throw new Error('Method not implemented'); }
  async saveMessage(message) { throw new Error('Method not implemented'); }
  async findMessagesByRideId(rideId) { throw new Error('Method not implemented'); }
  async setDriverOffline(driverId) { throw new Error('Method not implemented'); }
}

module.exports = TrackingRepository;

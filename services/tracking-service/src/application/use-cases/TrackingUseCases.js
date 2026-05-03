const { v4: uuidv4 } = require('uuid');
const Location = require('../../domain/models/Location');
const Message = require('../../domain/models/Message');

class TrackingUseCases {
  constructor(trackingRepository) {
    this.trackingRepository = trackingRepository;
  }

  async updateLocation(data) {
    const { driverId, latitude, longitude, isOnline } = data;
    const location = new Location({
      id: uuidv4(),
      driverId,
      latitude,
      longitude,
      isOnline: isOnline !== false
    });
    await this.trackingRepository.saveLocation(location);
    return { success: true };
  }

  async getNearbyDrivers(lat, lng, radius) {
    return this.trackingRepository.findNearbyDrivers(lat, lng, radius);
  }

  async getMessages(rideId) {
    return this.trackingRepository.findMessagesByRideId(rideId);
  }

  async saveChatMessage(data) {
    const { rideId, senderId, message } = data;
    const msg = new Message({
      id: uuidv4(),
      rideId,
      senderId,
      message
    });
    await this.trackingRepository.saveMessage(msg);
    return msg;
  }

  async setDriverOffline(driverId) {
    await this.trackingRepository.setDriverOffline(driverId);
  }
}

module.exports = TrackingUseCases;

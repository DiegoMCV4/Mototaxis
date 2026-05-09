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
    const { rideId, senderId, text, message } = data;
    const content = text || message;
    const msg = new Message({
      id: uuidv4(),
      rideId,
      senderId,
      message: content
    });
    await this.trackingRepository.saveMessage(msg);
    return msg;
  }

  async createRide(data) {
    return this.trackingRepository.createRide(data);
  }

  async updateRideStatus(rideId, status) {
    return this.trackingRepository.updateRideStatus(rideId, status);
  }

  async setDriverOffline(driverId) {
    await this.trackingRepository.setDriverOffline(driverId);
  }
}

module.exports = TrackingUseCases;

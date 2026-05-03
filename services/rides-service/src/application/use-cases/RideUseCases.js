const { v4: uuidv4 } = require('uuid');
const Ride = require('../../domain/models/Ride');

class RideUseCases {
  constructor(rideRepository) {
    this.rideRepository = rideRepository;
  }

  async requestRide(data) {
    const { passengerId, pickupLocation, dropoffLocation } = data;
    if (!passengerId || !pickupLocation || !dropoffLocation) {
      throw new Error('Campos requeridos faltantes');
    }

    const rideId = uuidv4();
    const newRide = new Ride({ id: rideId, ...data });

    await this.rideRepository.save(newRide);
    return this.rideRepository.findById(rideId);
  }

  async acceptRide(rideId, driverId) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) throw new Error('Viaje no encontrado');
    if (ride.status !== 'searching') throw new Error('El viaje ya fue aceptado o completado');

    await this.rideRepository.update(rideId, { driverId, status: 'accepted' });
    return this.rideRepository.findById(rideId);
  }

  async startRide(rideId) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) throw new Error('Viaje no encontrado');

    await this.rideRepository.update(rideId, { status: 'in_progress', startTime: new Date() });
    return this.rideRepository.findById(rideId);
  }

  async completeRide(rideId, data) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) throw new Error('Viaje no encontrado');

    const { actualPrice, distance, duration } = data;
    await this.rideRepository.update(rideId, {
      status: 'completed',
      endTime: new Date(),
      actualPrice: actualPrice || ride.estimatedPrice,
      distance: distance || null,
      duration: duration || null
    });

    // Incrementar viajes
    await this.rideRepository.incrementUserRides(ride.passengerId);
    if (ride.driverId) await this.rideRepository.incrementUserRides(ride.driverId);

    return this.rideRepository.findById(rideId);
  }

  async cancelRide(rideId) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) throw new Error('Viaje no encontrado');

    await this.rideRepository.update(rideId, { status: 'cancelled' });
    return { success: true, message: 'Viaje cancelado' };
  }

  async getActiveRides(userId) {
    return this.rideRepository.findActiveByUserId(userId);
  }

  async getHistory(userId) {
    return this.rideRepository.findHistoryByUserId(userId);
  }

  async getAvailableRides() {
    return this.rideRepository.findAvailable();
  }
}

module.exports = RideUseCases;

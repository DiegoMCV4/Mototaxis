class Ride {
  constructor({ id, passengerId, driverId, status, pickupLocation, pickupLat, pickupLng, dropoffLocation, dropoffLat, dropoffLng, paymentMethod, estimatedPrice, actualPrice, distance, duration, startTime, endTime, createdAt }) {
    this.id = id;
    this.passengerId = passengerId;
    this.driverId = driverId || null;
    this.status = status || 'searching';
    this.pickupLocation = pickupLocation;
    this.pickupLat = pickupLat;
    this.pickupLng = pickupLng;
    this.dropoffLocation = dropoffLocation;
    this.dropoffLat = dropoffLat;
    this.dropoffLng = dropoffLng;
    this.paymentMethod = paymentMethod || 'cash';
    this.estimatedPrice = estimatedPrice || 0;
    this.actualPrice = actualPrice || null;
    this.distance = distance || null;
    this.duration = duration || null;
    this.startTime = startTime || null;
    this.endTime = endTime || null;
    this.createdAt = createdAt || new Date();
  }
}

module.exports = Ride;

class Location {
  constructor({ id, driverId, latitude, longitude, isOnline, updatedAt }) {
    this.id = id;
    this.driverId = driverId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.isOnline = isOnline !== false;
    this.updatedAt = updatedAt || new Date();
  }
}

module.exports = Location;

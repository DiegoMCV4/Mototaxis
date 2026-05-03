class TrackingController {
  constructor(trackingUseCases) {
    this.trackingUseCases = trackingUseCases;
  }

  async updateLocation(req, res) {
    try {
      const result = await this.trackingUseCases.updateLocation(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getNearbyDrivers(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      const drivers = await this.trackingUseCases.getNearbyDrivers(lat, lng, radius);
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const messages = await this.trackingUseCases.getMessages(req.params.rideId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TrackingController;

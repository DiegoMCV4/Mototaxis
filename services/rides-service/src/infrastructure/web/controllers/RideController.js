class RideController {
  constructor(rideUseCases) {
    this.rideUseCases = rideUseCases;
  }

  async requestRide(req, res) {
    try {
      const ride = await this.rideUseCases.requestRide(req.body);
      res.status(201).json(ride);
    } catch (error) {
      res.status(error.message.includes('faltantes') ? 400 : 500).json({ error: error.message });
    }
  }

  async acceptRide(req, res) {
    try {
      const { driverId } = req.body;
      const ride = await this.rideUseCases.acceptRide(req.params.rideId, driverId);
      res.json(ride);
    } catch (error) {
      const status = error.message.includes('encontrado') ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  async startRide(req, res) {
    try {
      const ride = await this.rideUseCases.startRide(req.params.rideId);
      res.json(ride);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async completeRide(req, res) {
    try {
      const ride = await this.rideUseCases.completeRide(req.params.rideId, req.body);
      res.json(ride);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async cancelRide(req, res) {
    try {
      const result = await this.rideUseCases.cancelRide(req.params.rideId);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getActiveRides(req, res) {
    try {
      const rides = await this.rideUseCases.getActiveRides(req.params.userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req, res) {
    try {
      const rides = await this.rideUseCases.getHistory(req.params.userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailableRides(req, res) {
    try {
      const rides = await this.rideUseCases.getAvailableRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RideController;

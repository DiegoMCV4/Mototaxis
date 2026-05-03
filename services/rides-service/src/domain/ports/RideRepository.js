class RideRepository {
  async save(ride) { throw new Error('Method not implemented'); }
  async findById(id) { throw new Error('Method not implemented'); }
  async update(id, updates) { throw new Error('Method not implemented'); }
  async findActiveByUserId(userId) { throw new Error('Method not implemented'); }
  async findHistoryByUserId(userId) { throw new Error('Method not implemented'); }
  async findAvailable() { throw new Error('Method not implemented'); }
  async incrementUserRides(userId) { throw new Error('Method not implemented'); }
}

module.exports = RideRepository;

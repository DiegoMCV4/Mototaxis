class PaymentRepository {
  async saveMethod(method) { throw new Error('Method not implemented'); }
  async findMethodsByUserId(userId) { throw new Error('Method not implemented'); }
  async deleteMethod(methodId) { throw new Error('Method not implemented'); }
  async clearDefaultMethod(userId) { throw new Error('Method not implemented'); }
  async saveTransaction(transaction) { throw new Error('Method not implemented'); }
  async findTransactionsByUserId(userId) { throw new Error('Method not implemented'); }
  async updateWalletBalance(userId, amount) { throw new Error('Method not implemented'); }
  async getWalletBalance(userId) { throw new Error('Method not implemented'); }
  async findDriverByRideId(rideId) { throw new Error('Method not implemented'); }
}

module.exports = PaymentRepository;

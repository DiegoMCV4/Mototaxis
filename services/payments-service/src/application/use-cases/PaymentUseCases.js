const { v4: uuidv4 } = require('uuid');
const PaymentMethod = require('../../domain/models/PaymentMethod');
const Transaction = require('../../domain/models/Transaction');

class PaymentUseCases {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  async addPaymentMethod(data) {
    const { userId, type, cardBrand, lastFour, isDefault } = data;
    if (!userId || !type) throw new Error('userId y type son requeridos');

    if (isDefault) {
      await this.paymentRepository.clearDefaultMethod(userId);
    }

    const method = new PaymentMethod({
      id: uuidv4(),
      userId,
      type,
      cardBrand,
      lastFour,
      isDefault
    });

    return this.paymentRepository.saveMethod(method);
  }

  async getPaymentMethods(userId) {
    return this.paymentRepository.findMethodsByUserId(userId);
  }

  async deletePaymentMethod(methodId) {
    const success = await this.paymentRepository.deleteMethod(methodId);
    if (!success) throw new Error('Método de pago no encontrado');
    return { success: true };
  }

  async chargeRide(data) {
    const { rideId, userId, amount, description } = data;
    if (!userId || !amount) throw new Error('userId y amount son requeridos');

    const transaction = new Transaction({
      id: uuidv4(),
      rideId,
      userId,
      amount,
      type: 'charge',
      description: description || 'Cobro de viaje'
    });

    await this.paymentRepository.saveTransaction(transaction);

    // Ganancia del conductor
    if (rideId) {
      const driverId = await this.paymentRepository.findDriverByRideId(rideId);
      if (driverId) {
        const driverEarning = amount * 0.8;
        await this.paymentRepository.updateWalletBalance(driverId, driverEarning);
        
        await this.paymentRepository.saveTransaction(new Transaction({
          id: uuidv4(),
          rideId,
          userId: driverId,
          amount: driverEarning,
          type: 'payment',
          description: 'Ganancia de viaje'
        }));
      }
    }

    return transaction;
  }

  async topUpWallet(userId, amount) {
    if (!userId || !amount || amount <= 0) throw new Error('userId y amount válido son requeridos');

    const transaction = new Transaction({
      id: uuidv4(),
      userId,
      amount,
      type: 'topup',
      description: 'Recarga de wallet'
    });

    await this.paymentRepository.saveTransaction(transaction);
    await this.paymentRepository.updateWalletBalance(userId, amount);
    
    const newBalance = await this.paymentRepository.getWalletBalance(userId);
    return { ...transaction, newBalance };
  }

  async getTransactions(userId) {
    return this.paymentRepository.findTransactionsByUserId(userId);
  }

  async getWalletBalance(userId) {
    const balance = await this.paymentRepository.getWalletBalance(userId);
    if (balance === null) throw new Error('Usuario no encontrado');
    return { userId, balance };
  }
}

module.exports = PaymentUseCases;

class PaymentController {
  constructor(paymentUseCases) {
    this.paymentUseCases = paymentUseCases;
  }

  async addMethod(req, res) {
    try {
      const method = await this.paymentUseCases.addPaymentMethod(req.body);
      res.status(201).json(method);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMethods(req, res) {
    try {
      const methods = await this.paymentUseCases.getPaymentMethods(req.params.userId);
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMethod(req, res) {
    try {
      const result = await this.paymentUseCases.deletePaymentMethod(req.params.methodId);
      res.json(result);
    } catch (error) {
      res.status(error.message.includes('encontrado') ? 404 : 500).json({ error: error.message });
    }
  }

  async chargeRide(req, res) {
    try {
      const transaction = await this.paymentUseCases.chargeRide(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async topUp(req, res) {
    try {
      const result = await this.paymentUseCases.topUpWallet(req.body.userId, req.body.amount);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTransactions(req, res) {
    try {
      const transactions = await this.paymentUseCases.getTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWalletBalance(req, res) {
    try {
      const result = await this.paymentUseCases.getWalletBalance(req.params.userId);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;

class PaymentMethod {
  constructor({ id, userId, type, cardBrand, lastFour, isDefault, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.cardBrand = cardBrand || null;
    this.lastFour = lastFour || null;
    this.isDefault = isDefault === true || isDefault === 1;
    this.createdAt = createdAt || new Date();
  }
}

module.exports = PaymentMethod;

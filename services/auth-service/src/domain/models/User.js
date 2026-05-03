class User {
  constructor({ id, email, password, fullName, userType, photo, rating, rides, walletBalance, phone, createdAt }) {
    this.id = id;
    this.email = email;
    this.password = password; // Hashed
    this.fullName = fullName;
    this.userType = userType;
    this.photo = photo;
    this.rating = rating || 5.0;
    this.rides = rides || 0;
    this.walletBalance = walletBalance || 0;
    this.phone = phone || null;
    this.createdAt = createdAt || new Date();
  }

  // Domain logic examples (if needed later)
  // hasSufficientBalance(amount) { return this.walletBalance >= amount; }
}

module.exports = User;

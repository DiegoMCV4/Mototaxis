class Message {
  constructor({ id, rideId, senderId, message, createdAt, senderName, senderPhoto }) {
    this.id = id;
    this.rideId = rideId;
    this.senderId = senderId;
    this.message = message;
    this.createdAt = createdAt || new Date();
    this.senderName = senderName;
    this.senderPhoto = senderPhoto;
  }
}

module.exports = Message;

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mototaxi_ratings';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('❌ Ratings Service - Error conectando a MongoDB:', err.message);
});

db.once('open', () => {
  console.log('✅ Ratings Service conectado a MongoDB (mototaxi_ratings)');
});

module.exports = mongoose;

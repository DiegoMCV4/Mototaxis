const mysql = require('mysql2/promise');
const Redis = require('ioredis');
require('dotenv').config();

// ==================== MySQL (mensajes persistentes) ====================
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'mototaxi123',
  database: process.env.DB_NAME     || 'mototaxi_tracking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Tracking Service conectado a MySQL (mototaxi_tracking)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL (Tracking):', err.message);
  });

// ==================== Redis (ubicaciones en tiempo real) ====================
const redis = new Redis({
  host:              process.env.REDIS_HOST     || 'localhost',
  port:              process.env.REDIS_PORT     || 6379,
  password:          process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  lazyConnect: false
});

redis.on('connect', () => {
  console.log('✅ Tracking Service conectado a Redis (ubicaciones en tiempo real)');
});

redis.on('error', (err) => {
  console.error('❌ Error conectando a Redis:', err.message);
});

module.exports = { pool, redis };

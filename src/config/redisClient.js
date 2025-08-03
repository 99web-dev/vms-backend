// src/config/redisClient.js
const Redis = require('ioredis');

const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379,
  enableOfflineQueue: false,
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redisClient;

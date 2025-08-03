// src/middlewares/rateLimiters/registrationRateLimiter.js

const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../../config/redisClient'); // ✅ use shared Redis

// Create rate limiters for registration attempts
const ipLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'register_ip',
  points: 5,               // Max 5 attempts
  duration: 3600,          // 1 hour window
  blockDuration: 3600      // Block for 1 hour
});

const emailLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'register_email',
  points: 5,
  duration: 3600,
  blockDuration: 3600
});

// ✅ Middleware for registration rate limiting
const registrationRateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const email = req.body.email;

    // Basic email presence check
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required for registration rate limiting',
      });
    }

    // Consume 1 point for IP and Email
    const [ipRes, emailRes] = await Promise.all([
      ipLimiter.consume(ip),
      emailLimiter.consume(email.toLowerCase())
    ]);

    // Optional header: show remaining attempts
    res.setHeader(
      'X-RegisterRateLimit-Remaining',
      Math.min(ipRes.remainingPoints, emailRes.remainingPoints)
    );

    next(); // ✅ Proceed to registration
  } catch (err) {
    if (err instanceof Error && err.msBeforeNext) {
      return res.status(429).json({
        success: false,
        message: `Too many registration attempts. Try again in ${Math.ceil(err.msBeforeNext / 1000)} seconds.`,
      });
    }

    console.error('Registration rate limiter error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in rate limiter',
    });
  }
};

module.exports = registrationRateLimiter;

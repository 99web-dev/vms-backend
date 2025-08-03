// src/middlewares/rateLimiters/loginRateLimiter.js

const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../../config/redisClient'); // ✅ Shared Redis instance

// ✅ Create Redis-based rate limiters for IP and Email
const ipLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_ip',
  points: 5,               // Max 5 login attempts
  duration: 15 * 60,       // Time window: 15 minutes
  blockDuration: 15 * 60   // Block for 15 minutes after limit reached
});

const emailLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_email',
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60
});

// ✅ Middleware to protect login route
const loginRateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const email = req.body.email;

    // Basic email presence validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Consume 1 point for both IP and email
    const [ipRes, emailRes] = await Promise.all([
      ipLimiter.consume(ip),
      emailLimiter.consume(email.toLowerCase())
    ]);

    // Optional: Add a custom header for remaining attempts
    res.setHeader(
      'X-LoginRateLimit-Remaining',
      Math.min(ipRes.remainingPoints, emailRes.remainingPoints)
    );

    next(); // ✅ Let the request proceed to controller
  } catch (err) {
    // ✅ Rate limiter exceeded (not a true Error object)
    if (err && typeof err === 'object' && 'msBeforeNext' in err) {
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Try again in ${Math.ceil(err.msBeforeNext / 1000)} seconds.`,
      });
    }

    // ❌ Unhandled error (Redis crash or unknown error)
    console.error('Login rate limiter error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in login rate limiter',
    });
  }
};

module.exports = loginRateLimiter;

// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middlewares/errorHandler');

require('dotenv').config();

const app = express();

// ------------------------
// CORS Configuration
// ------------------------
const allowedOrigins = [
  'http://localhost:3000', // React frontend
  'http://localhost:19006', // React Native (Expo)
  'https://your-production-frontend.com' // Replace with your actual frontend domain
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools like Postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // If you're using tokens or cookies
};

app.use(cors(corsOptions));

// ------------------------
// Security & Parsing Middleware
// ------------------------
app.use(helmet()); // Sets secure HTTP headers
app.use(morgan('dev')); // Logs HTTP requests
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// ------------------------
// Routes
// ------------------------
app.use('/api/admin', adminRoutes);

// ------------------------
// CORS Error Handler (Optional but Recommended)
// ------------------------
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy error: This origin is not allowed to access this resource.'
    });
  }
  next(err);
});

// ------------------------
// Global Error Handler
// ------------------------
app.use(errorHandler);

module.exports = app;

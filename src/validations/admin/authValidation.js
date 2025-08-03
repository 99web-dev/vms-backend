// src/validations/admin/authValidation.js
const { body } = require('express-validator');

exports.registerValidator = [
  // Full Name
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Full name must contain only letters and spaces'),

  // Email
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .isLength({ min: 6, max: 254 }).withMessage('Email must be between 6 and 254 characters')
    .isEmail().withMessage('Must be a valid email')
    .custom(value => {
      if (/\s/.test(value)) {
        throw new Error('Email must not contain spaces');
      }
      return true;
    }),

  // Password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }).withMessage('Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 symbol')
];

// Login Validator
exports.loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .trim()
    .isLength({ min: 6, max: 254 }).withMessage('Email must be between 6 and 254 characters')
    .isEmail().withMessage('Must be a valid email')
    .custom(value => {
      if (/\s/.test(value)) {
        throw new Error('Email must not contain spaces');
      }
      return true;
    }),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];


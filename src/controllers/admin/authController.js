const { validationResult } = require('express-validator');
const authService = require('../../services/admin/authService');

// Controller to register a new admin
exports.register = async (req, res, next) => {
  try {
    // Validate request input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array()
      });
    }

    // Register via service layer
    const result = await authService.register(req.body);

    // Send safe response
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: result
    });
  } catch (error) {
    next(error); // Global error handler
  }
};

// Controller to log in an admin
exports.login = async (req, res, next) => {
  try {
    // Validate request input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array()
      });
    }

    // Login via service (pass req for IP/User-Agent)
    const { token, user } = await authService.login(req.body, req);

    // Set HttpOnly cookie (best for security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user
    });
  } catch (error) {
    next(error);
  }
};

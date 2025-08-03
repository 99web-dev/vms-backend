const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/authController');
const { registerValidator } = require('../../validations/admin/authValidation');
const registrationRateLimiter = require('../../middlewares/rateLimiters/registrationRateLimiter');
const { loginValidator } = require('../../validations/admin/authValidation');
const loginRateLimiter = require('../../middlewares/rateLimiters/loginRateLimiter');

router.post('/register', registrationRateLimiter, registerValidator, authController.register);
router.post('/login',loginRateLimiter, loginValidator, authController.login);

module.exports = router;

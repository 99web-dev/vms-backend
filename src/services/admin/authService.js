const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');

// Register Admin
exports.register = async ({ fullName, email, password }) => {
  // Check if already registered
  const existing = await Admin.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // Hash password securely
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin
  const admin = await Admin.create({
    fullName,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email
  };
};

// Login Admin
exports.login = async ({ email, password }, req) => {
  const admin = await Admin.findOne({ where: { email: email.toLowerCase() } });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Get current IP and user-agent from request
  const ip = req.ip;
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Sign JWT with IP and User-Agent
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      ip,
      userAgent
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role
    }
  };
};

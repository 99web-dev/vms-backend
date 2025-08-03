const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    const currentIp = req.ip;
    const currentAgent = req.headers['user-agent'] || 'unknown';

    if (decoded.ip !== currentIp || decoded.userAgent !== currentAgent) {
      return res.status(403).json({ success: false, message: 'Token not valid for this device or location' });
    }

    req.user = decoded; // Attach to request
    next();
  });
};

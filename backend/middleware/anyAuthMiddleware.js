const jwt = require('jsonwebtoken');

// For routes that both the Admin panel and the Associate portal use
// (currently the tutor listing manager). Sets req.admin for admin tokens
// and req.associate for associate tokens; anything else is rejected.
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role === 'admin') req.admin = decoded;
    else if (decoded.role === 'associate') req.associate = decoded;
    else return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
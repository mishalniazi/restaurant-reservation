const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userRepo = AppDataSource.getRepository('User');
    req.user = await userRepo.findOneBy({ id: payload.id });
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

module.exports = { requireAuth, requireRole };

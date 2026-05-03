const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');

const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const repo = AppDataSource.getRepository('User');
    if (await repo.findOneBy({ email })) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = repo.create({ name, email, password: hashed, role: 'customer' });
    await repo.save(user);
    res.status(201).json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const repo = AppDataSource.getRepository('User');
    const user = await repo.findOneBy({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/reset-admin - dev only, removes and recreates admin
router.post('/reset-admin', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('User');
    await repo.delete({ email: 'admin@restaurant.com' });
    await repo.delete({ email: 'staff@restaurant.com' });
    const hashed = await bcrypt.hash('admin123', 10);
    const hashedStaff = await bcrypt.hash('staff123', 10);
    await repo.save(repo.create({ name: 'Admin', email: 'admin@restaurant.com', password: hashed, role: 'admin' }));
    await repo.save(repo.create({ name: 'Staff', email: 'staff@restaurant.com', password: hashedStaff, role: 'staff' }));
    res.json({ message: 'Admin and staff reset. Login with admin@restaurant.com / admin123' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;

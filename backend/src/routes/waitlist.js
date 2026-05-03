const router = require('express').Router();
const { AppDataSource } = require('../data-source');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/waitlist?date=
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const repo = AppDataSource.getRepository('Waitlist');
    let qb = repo.createQueryBuilder('w').orderBy('w.joinedAt', 'ASC');
    if (req.user.role === 'customer') qb = qb.where('w.customerId = :uid', { uid: req.user.id });
    if (date) qb = qb.andWhere('w.date = :date', { date });
    res.json(await qb.getMany());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/waitlist
router.post('/', requireAuth, async (req, res) => {
  try {
    const { date, guests } = req.body;
    if (!date || !guests) return res.status(400).json({ error: 'date and guests required' });
    const repo = AppDataSource.getRepository('Waitlist');
    const existing = await repo.findOne({ where: { customerId: req.user.id, date, notified: false } });
    if (existing) return res.status(409).json({ error: 'Already on waitlist for this date' });
    const entry = repo.create({ customerId: req.user.id, customerName: req.user.name, date, guests: parseInt(guests), notified: false });
    await repo.save(entry);
    res.status(201).json(entry);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/waitlist/:id/notify  (staff/admin)
router.put('/:id/notify', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Waitlist');
    const entry = await repo.findOneBy({ id: req.params.id });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    entry.notified = true;
    await repo.save(entry);
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/waitlist/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Waitlist');
    const entry = await repo.findOneBy({ id: req.params.id });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'customer' && entry.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await repo.remove(entry);
    res.json({ message: 'Removed from waitlist' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

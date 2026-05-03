const router = require('express').Router();
const { AppDataSource } = require('../data-source');
const { requireAuth, requireRole } = require('../middleware/auth');

const SLOT_DURATION = 90; // minutes

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// GET /api/tables/availability?date=&time=&guests=
router.get('/availability', async (req, res) => {
  try {
    const { date, time, guests } = req.query;
    if (!date || !time) return res.status(400).json({ error: 'date and time required' });
    const guestCount = parseInt(guests) || 1;
    const slotEnd = addMinutes(time, SLOT_DURATION);

    const tableRepo = AppDataSource.getRepository('RestaurantTable');
    const resRepo = AppDataSource.getRepository('Reservation');

    const tables = await tableRepo.find();
    const conflicts = await resRepo
      .createQueryBuilder('r')
      .where('r.date = :date', { date })
      .andWhere('r.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'seated'] })
      .getMany();

    const available = tables.filter(t => {
      if (t.capacity < guestCount) return false;
      return !conflicts.find(r =>
        r.tableId === t.id &&
        r.time < slotEnd &&
        addMinutes(r.time, SLOT_DURATION) > time
      );
    });

    // If no tables seeded yet, return empty with helpful message
    if (tables.length === 0) return res.json([]);
    res.json(available);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/tables
router.get('/', requireAuth, async (req, res) => {
  const repo = AppDataSource.getRepository('RestaurantTable');
  res.json(await repo.find());
});

// POST /api/tables
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { number, capacity, location } = req.body;
    if (!number || !capacity) return res.status(400).json({ error: 'number and capacity required' });
    const repo = AppDataSource.getRepository('RestaurantTable');
    const table = repo.create({ number, capacity, location: location || 'main' });
    await repo.save(table);
    res.status(201).json(table);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/tables/:id
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('RestaurantTable');
    const table = await repo.findOneBy({ id: req.params.id });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    Object.assign(table, req.body);
    await repo.save(table);
    res.json(table);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/tables/:id
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('RestaurantTable');
    const table = await repo.findOneBy({ id: req.params.id });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    await repo.remove(table);
    res.json({ message: 'Table removed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

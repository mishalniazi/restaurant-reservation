const router = require('express').Router();
const { AppDataSource } = require('../data-source');
const { requireAuth, requireRole } = require('../middleware/auth');

const SLOT_DURATION = 90;
const VALID_STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'];

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// GET /api/reservations?date=&guests=&status=&search=&sortBy=&order=&page=&limit=
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date, guests, status, search, sortBy = 'date', order = 'ASC', page = 1, limit = 10 } = req.query;
    const repo = AppDataSource.getRepository('Reservation');
    let qb = repo.createQueryBuilder('r').leftJoinAndSelect('r.table', 'table');

    if (req.user.role === 'customer') qb = qb.andWhere('r.customerId = :uid', { uid: req.user.id });
    if (date)   qb = qb.andWhere('r.date = :date', { date });
    if (status) qb = qb.andWhere('r.status = :status', { status });
    if (guests) qb = qb.andWhere('r.guests >= :guests', { guests: parseInt(guests) });
    if (search) qb = qb.andWhere('LOWER(r.customerName) LIKE :s', { s: `%${search.toLowerCase()}%` });

    const allowedSort = ['date', 'time', 'guests', 'status', 'createdAt'];
    const col = allowedSort.includes(sortBy) ? sortBy : 'date';
    qb = qb.orderBy(`r.${col}`, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(parseInt(limit)).getMany();
    res.json({ data, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reservations
router.post('/', requireAuth, async (req, res) => {
  try {
    const { tableId, date, time, guests, notes } = req.body;
    if (!tableId || !date || !time || !guests) return res.status(400).json({ error: 'tableId, date, time, guests required' });

    const tableRepo = AppDataSource.getRepository('RestaurantTable');
    const table = await tableRepo.findOneBy({ id: tableId });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    if (table.capacity < guests) return res.status(400).json({ error: 'Table too small' });

    const resRepo = AppDataSource.getRepository('Reservation');
    const slotEnd = addMinutes(time, SLOT_DURATION);
    const existing = await resRepo
      .createQueryBuilder('r')
      .where('r.tableId = :tableId', { tableId })
      .andWhere('r.date = :date', { date })
      .andWhere('r.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'seated'] })
      .getMany();

    const conflict = existing.find(r =>
      r.time < slotEnd && addMinutes(r.time, SLOT_DURATION) > time
    );

    if (conflict) return res.status(409).json({ error: 'Table not available at this time' });

    const reservation = resRepo.create({
      customerId: req.user.id,
      customerName: req.user.name,
      tableId,
      date,
      time,
      guests: parseInt(guests),
      status: 'confirmed',
      notes: notes || '',
    });
    await resRepo.save(reservation);
    res.status(201).json(reservation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reservations/walkin  (staff/admin)
router.post('/walkin', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { tableId, guests, notes, customerName } = req.body;
    if (!tableId || !guests) return res.status(400).json({ error: 'tableId and guests required' });
    const now = new Date();
    const resRepo = AppDataSource.getRepository('Reservation');
    const reservation = resRepo.create({
      customerId: null,
      customerName: customerName || 'Walk-in',
      tableId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      guests: parseInt(guests),
      status: 'seated',
      notes: notes || '',
    });
    await resRepo.save(reservation);
    res.status(201).json(reservation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reservations/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Reservation');
    const r = await repo.findOne({ where: { id: req.params.id }, relations: ['table'] });
    if (!r) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'customer' && r.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/reservations/:id/status  (staff/admin)
router.put('/:id/status', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Reservation');
    const r = await repo.findOneBy({ id: req.params.id });
    if (!r) return res.status(404).json({ error: 'Not found' });
    if (!VALID_STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
    r.status = req.body.status;
    await repo.save(r);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/reservations/:id  (customer updates own)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Reservation');
    const r = await repo.findOneBy({ id: req.params.id });
    if (!r) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'customer' && r.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (['completed', 'seated', 'no-show'].includes(r.status)) return res.status(400).json({ error: 'Cannot modify' });
    const { date, time, guests, notes } = req.body;
    if (date)  r.date = date;
    if (time)  r.time = time;
    if (guests) r.guests = parseInt(guests);
    if (notes !== undefined) r.notes = notes;
    await repo.save(r);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/reservations/:id  (cancel)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Reservation');
    const r = await repo.findOneBy({ id: req.params.id });
    if (!r) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'customer' && r.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    r.status = 'cancelled';
    await repo.save(r);
    res.json({ message: 'Cancelled', reservation: r });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

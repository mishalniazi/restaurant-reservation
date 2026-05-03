const request = require('supertest');
const { AppDataSource } = require('../data-source');
const app = require('../index');
const bcrypt = require('bcryptjs');

let customerToken, staffToken, tableId, reservationId;

beforeAll(async () => {
  await AppDataSource.initialize();
  const userRepo  = AppDataSource.getRepository('User');
  const tableRepo = AppDataSource.getRepository('RestaurantTable');

  // create test users
  const hash = await bcrypt.hash('pass', 10);
  const customer = await userRepo.save(userRepo.create({ name: 'C', email: 'c_test@x.com', password: hash, role: 'customer' }));
  const staff    = await userRepo.save(userRepo.create({ name: 'S', email: 's_test@x.com', password: hash, role: 'staff' }));

  let r = await request(app).post('/api/auth/login').send({ email: 'c_test@x.com', password: 'pass' });
  customerToken = r.body.token;
  r = await request(app).post('/api/auth/login').send({ email: 's_test@x.com', password: 'pass' });
  staffToken = r.body.token;

  const table = await tableRepo.save(tableRepo.create({ number: 99, capacity: 4, location: 'test' }));
  tableId = table.id;
});

afterAll(async () => {
  const userRepo  = AppDataSource.getRepository('User');
  const tableRepo = AppDataSource.getRepository('RestaurantTable');
  await AppDataSource.getRepository('Reservation').delete({ tableId });
  await tableRepo.delete({ number: 99 });
  await userRepo.delete({ email: 'c_test@x.com' });
  await userRepo.delete({ email: 's_test@x.com' });
  await AppDataSource.destroy();
});

describe('Reservations API', () => {
  it('POST /api/reservations - customer creates reservation', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ tableId, date: '2026-12-01', time: '18:00', guests: 2 });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('confirmed');
    reservationId = res.body.id;
  });

  it('POST /api/reservations - conflict returns 409', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ tableId, date: '2026-12-01', time: '18:30', guests: 2 });
    expect(res.status).toBe(409);
  });

  it('GET /api/reservations - customer sees own reservations', async () => {
    const res = await request(app)
      .get('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every(r => r.customerId !== undefined)).toBe(true);
  });

  it('PUT /api/reservations/:id/status - staff updates status', async () => {
    const res = await request(app)
      .put(`/api/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'seated' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('seated');
  });

  it('DELETE /api/reservations/:id - cancel', async () => {
    // create a fresh one to cancel
    const r2 = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ tableId, date: '2026-12-02', time: '18:00', guests: 2 });
    const res = await request(app)
      .delete(`/api/reservations/${r2.body.id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reservation.status).toBe('cancelled');
  });

  it('GET /api/reservations - unauthenticated returns 401', async () => {
    const res = await request(app).get('/api/reservations');
    expect(res.status).toBe(401);
  });
});

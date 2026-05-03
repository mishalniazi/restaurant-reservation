const request = require('supertest');
const { AppDataSource } = require('../data-source');
const app = require('../index');

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.getRepository('User').delete({ email: 'test_jest@email.com' });
  await AppDataSource.destroy();
});

describe('Auth API', () => {
  it('POST /api/auth/register - creates a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jest User', email: 'test_jest@email.com', password: 'testpass',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('customer');
  });

  it('POST /api/auth/register - rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jest User', email: 'test_jest@email.com', password: 'testpass',
    });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login - valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_jest@email.com', password: 'testpass',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login - invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_jest@email.com', password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });
});

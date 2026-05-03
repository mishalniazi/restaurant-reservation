require('dotenv').config();
require('reflect-metadata');
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('./data-source');

async function seed() {
  await AppDataSource.initialize();

  const userRepo  = AppDataSource.getRepository('User');
  const tableRepo = AppDataSource.getRepository('RestaurantTable');

  // seed users
  const users = [
    { name: 'Admin',    email: 'admin@restaurant.com', password: 'admin123',  role: 'admin' },
    { name: 'Staff',    email: 'staff@restaurant.com', password: 'staff123',  role: 'staff' },
    { name: 'Customer', email: 'john@email.com',       password: 'pass123',   role: 'customer' },
  ];
  for (const u of users) {
    if (!(await userRepo.findOneBy({ email: u.email }))) {
      await userRepo.save(userRepo.create({ ...u, password: await bcrypt.hash(u.password, 10) }));
    }
  }

  // seed tables
  const tables = [
    { number: 1, capacity: 2, location: 'window' },
    { number: 2, capacity: 4, location: 'main' },
    { number: 3, capacity: 4, location: 'main' },
    { number: 4, capacity: 6, location: 'private' },
    { number: 5, capacity: 8, location: 'private' },
  ];
  for (const t of tables) {
    if (!(await tableRepo.findOneBy({ number: t.number }))) {
      await tableRepo.save(tableRepo.create(t));
    }
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });

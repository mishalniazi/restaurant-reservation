require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'restaurant_db',
  synchronize: true, // auto-creates tables in dev
  logging: false,
  entities: [
    require('./entities/User'),
    require('./entities/Table'),
    require('./entities/Reservation'),
    require('./entities/Waitlist'),
  ],
});

module.exports = { AppDataSource };

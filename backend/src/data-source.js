require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();

let dataSourceOptions;

if (process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL) {
  dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    logging: false,
    entities: [
      require('./entities/User'),
      require('./entities/Table'),
      require('./entities/Reservation'),
      require('./entities/Waitlist'),
    ],
  };
} else {
  dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'restaurant_db',
    synchronize: true,
    logging: false,
    entities: [
      require('./entities/User'),
      require('./entities/Table'),
      require('./entities/Reservation'),
      require('./entities/Waitlist'),
    ],
  };
}

const AppDataSource = new DataSource(dataSourceOptions);

module.exports = { AppDataSource };

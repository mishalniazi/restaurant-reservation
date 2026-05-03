require('dotenv').config();
require('reflect-metadata');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { AppDataSource } = require('./data-source');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/tables',       require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/waitlist',     require('./routes/waitlist'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(buildPath));
  app.get('*', (_, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

module.exports = app;

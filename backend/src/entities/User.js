const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id:        { primary: true, type: 'uuid', generated: 'uuid' },
    name:      { type: 'varchar' },
    email:     { type: 'varchar', unique: true },
    password:  { type: 'varchar' },
    role:      { type: 'varchar', default: 'customer' }, // admin | staff | customer
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    reservations: { type: 'one-to-many', target: 'Reservation', inverseSide: 'customer' },
    waitlistEntries: { type: 'one-to-many', target: 'Waitlist', inverseSide: 'customer' },
  },
});

module.exports = User;

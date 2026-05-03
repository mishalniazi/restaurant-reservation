const { EntitySchema } = require('typeorm');

const Waitlist = new EntitySchema({
  name: 'Waitlist',
  tableName: 'waitlist',
  columns: {
    id:           { primary: true, type: 'uuid', generated: 'uuid' },
    customerId:   { type: 'uuid' },
    customerName: { type: 'varchar' },
    date:         { type: 'varchar' },
    guests:       { type: 'int' },
    notified:     { type: 'boolean', default: false },
    joinedAt:     { type: 'timestamp', createDate: true },
  },
  relations: {
    customer: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'customerId' },
      onDelete: 'CASCADE',
    },
  },
});

module.exports = Waitlist;

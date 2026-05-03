const { EntitySchema } = require('typeorm');

const RestaurantTable = new EntitySchema({
  name: 'RestaurantTable',
  tableName: 'tables',
  columns: {
    id:       { primary: true, type: 'uuid', generated: 'uuid' },
    number:   { type: 'int' },
    capacity: { type: 'int' },
    location: { type: 'varchar', default: 'main' },
  },
  relations: {
    reservations: { type: 'one-to-many', target: 'Reservation', inverseSide: 'table' },
  },
});

module.exports = RestaurantTable;

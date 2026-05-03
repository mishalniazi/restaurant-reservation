const { EntitySchema } = require('typeorm');

const Reservation = new EntitySchema({
  name: 'Reservation',
  tableName: 'reservations',
  columns: {
    id:           { primary: true, type: 'uuid', generated: 'uuid' },
    customerId:   { type: 'uuid', nullable: true },
    customerName: { type: 'varchar', nullable: true },
    tableId:      { type: 'uuid' },
    date:         { type: 'varchar' },  // YYYY-MM-DD
    time:         { type: 'varchar' },  // HH:MM
    guests:       { type: 'int' },
    // status: pending | confirmed | seated | completed | cancelled | no-show
    status:       { type: 'varchar', default: 'confirmed' },
    notes:        { type: 'varchar', nullable: true },
    createdAt:    { type: 'timestamp', createDate: true },
  },
  relations: {
    customer: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'customerId' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    table: {
      type: 'many-to-one',
      target: 'RestaurantTable',
      joinColumn: { name: 'tableId' },
      onDelete: 'CASCADE',
    },
  },
});

module.exports = Reservation;

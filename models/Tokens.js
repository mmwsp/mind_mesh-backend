const { EntitySchema } = require('typeorm');
const User = require('./User');

const Tokens = new EntitySchema({
  name: 'Tokens',
  tableName: 'tokens',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    user_id: {
      type: 'int',
    },
    refresh_token: {
      type: 'longtext',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: User,
      joinColumn: {
        name: 'user_id',
      },
    },
  },
});

module.exports = Tokens;






const { EntitySchema } = require('typeorm');
const User = require('./User');

const Reaction = new EntitySchema({
  name: 'Reaction',
  tableName: 'reaction',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    author_id: {
      type: 'int',
    },
    type: {
      type: 'enum',
      enum: ['like', 'dislike'],
    },
    publish_date: {
      type: 'datetime',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    author: {
      type: 'many-to-one',
      target: User,
      joinColumn: {
        name: 'author_id',
      },
    },
  },
});

module.exports = Reaction;

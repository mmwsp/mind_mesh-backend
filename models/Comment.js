const { EntitySchema } = require('typeorm');
const User = require('./User');

const Comment = new EntitySchema({
  name: 'Comment',
  tableName: 'comment',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    author_id: {
      type: 'int',
    },
    publish_date: {
      type: 'datetime',
      default: () => 'CURRENT_TIMESTAMP',
    },
    content: {
      type: 'text',
    },
    status: {
      type: 'enum',
      enum: ['active', 'inactive'],
      default: 'active',
    },
    reply: {
      type: 'int',
      nullable: true,
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

module.exports = Comment;

const { EntitySchema } = require('typeorm');
const User = require('./User');

const Post = new EntitySchema({
  name: 'Post',
  tableName: 'post',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    author_id: {
      type: 'int',
    },
    title: {
      type: 'varchar',
    },
    publish_date: {
      type: 'datetime',
      default: () => 'CURRENT_TIMESTAMP',
    },
    status: {
      type: 'enum',
      enum: ['active', 'inactive'],
      default: 'active',
    },
    content: {
      type: 'longtext',
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

module.exports = Post;

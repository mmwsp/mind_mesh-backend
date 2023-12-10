const { EntitySchema } = require('typeorm');
const Post = require('./Post');
const Category = require('./Category');

const PostCategory = new EntitySchema({
  name: 'PostCategory',
  tableName: 'postcategory',
  columns: {
    post_id: {
      type: 'int',
      primary: true,
    },
    category_id: {
      type: 'int',
      primary: true,
    },
  },
  relations: {
    post: {
      type: 'many-to-one',
      target: Post,
      joinColumn: { name: 'post_id' },
      cascade: true,
    },
    category: {
      type: 'many-to-one',
      target: Category,
      joinColumn: { name: 'category_id' },
    },
  },
});

module.exports = PostCategory;
const { EntitySchema } = require('typeorm');

const Category = new EntitySchema({
  name: 'Category',
  tableName: 'category',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    description: {
      type: 'text',
    },
  },
});

module.exports = Category;

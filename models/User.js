const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'user',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    login: {
      type: 'varchar',
    },
    password: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
    },
    rating: {
      type: 'int',
      default: 0,
    },
    role: {
      type: 'enum',
      enum: ['admin', 'user'],
      default: 'user',
    },
    fullname: {
      type: 'varchar',
      nullable: true,
    },
    profile_image: {
      type: 'varchar',
      nullable: true,
    },
    email_confirmed: {
      type: 'boolean',
      default: false,
    },
    activation_link: {
      type: 'varchar',
      nullable: true,
    },
    reset_password_link: {
      type: 'longtext',
      nullable: true,
    },
  },
});

module.exports = User;
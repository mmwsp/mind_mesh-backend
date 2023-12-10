const { EntitySchema } = require('typeorm');
const Post = require('./Post');
const Reaction = require('./Reaction');

const PostReaction = new EntitySchema({
  name: 'PostReaction',
  tableName: 'postreaction',
  columns: {
    post_id: {
      primary: true,
      type: 'int',
    },
    reaction_id: {
      primary: true,
      type: 'int',
    },
  },
  relations: {
    post: {
      type: 'many-to-one',
      target: Post,
      joinColumn: {
        name: 'post_id',
      },
    },
    reaction: {
      type: 'many-to-one',
      target: Reaction,
      joinColumn: {
        name: 'reaction_id',
      },
    },
  },
});

module.exports = PostReaction;

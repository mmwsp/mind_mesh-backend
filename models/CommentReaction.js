const { EntitySchema } = require('typeorm');
const Comment = require('./Comment');
const Reaction = require('./Reaction');

const CommentReaction = new EntitySchema({
  name: 'CommentReaction',
  tableName: 'commentreaction',
  columns: {
    comment_id: {
      primary: true,
      type: 'int',
    },
    reaction_id: {
      primary: true,
      type: 'int',
    },
  },
  relations: {
    comment: {
      type: 'many-to-one',
      target: Comment,
      joinColumn: {
        name: 'comment_id',
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

module.exports = CommentReaction;

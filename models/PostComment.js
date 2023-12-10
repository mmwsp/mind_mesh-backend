const { EntitySchema } = require('typeorm');
const PostSchema = require('./Post');
const CommentSchema = require('./Comment');

const PostComment = new EntitySchema({
    name: 'PostComment',
    tableName: 'postcomment',
    columns: {
        post_id: {
            type: 'int',
            primary: true,
        },
        comment_id: {
            type: 'int',
            primary: true,
        },
    },
    relations: {
        post: {
            type: 'many-to-one',
            target: PostSchema,
            joinColumn: { name: 'post_id' },
            inverseSide: 'comments',
        },
        comment: {
            type: 'many-to-one',
            target: CommentSchema,
            joinColumn: { name: 'comment_id' },
            inverseSide: 'post',
        },
    },
});

module.exports = PostComment;


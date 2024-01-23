const  User  = require('../models/User');
const AppDataSource = require('../db_connection');
const ApiError = require('../exceptions/apiError');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommentDto = require('../dtos/CommentDto');
const PostComment = require('../models/PostComment');
const { In } = require('typeorm');
const userService = require('./user-service');
const reactionService = require('./reaction-service');
const CommentReaction = require('../models/CommentReaction');

class CommentService {
    async createComment(postId, content, author_id, reply) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id: postId});
        const author = await AppDataSource.getRepository(User).findOneBy({id: author_id});
        if(!post) {
            throw ApiError.badRequest(`Post is not exist`);
        }
        if(!author) {
            throw ApiError.badRequest(`Author is not exist`);
        }
        const comment = await AppDataSource.getRepository(Comment).create({content, author_id, reply});
        const savedComment = await AppDataSource.getRepository(Comment).save(comment);
        const postComment = await AppDataSource.getRepository(PostComment).create({ post_id: postId, comment_id: savedComment.id });
        await AppDataSource.getRepository(PostComment).save(postComment);

        const commentDto = new CommentDto(comment, author.login, author.profile_image, postId);
        return commentDto;
    }

    async getPostComments(postId) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id: postId});
        if(!post) {
            throw ApiError.badRequest(`Post is not exist`);
        }

        const postComments = await AppDataSource.getRepository(PostComment)
        .createQueryBuilder("postсomment")
        .where("postсomment.post_id = :postId", { postId: postId })
        .select("postсomment.comment_id")
        .getMany();

        const commentIds = postComments.map((postComment) => postComment.comment_id);
        const comments = await AppDataSource.getRepository(Comment).findBy({id: In(commentIds)});
        const authorIds = comments.map((comment) => comment.author_id);
        const authors = await AppDataSource.getRepository(User).findBy({id: In(authorIds)});

        const commentDtos = await Promise.all(comments.map(async (comment) => {
            const author = authors.find((author) => author.id === comment.author_id);
            const reactions = await reactionService.getCommentReactions(comment.id);
            return new CommentDto(comment, author.login, author.profile_image, postId, reactions);
          }));
        return commentDtos;
    }

    async deleteComment(id) {
        const comment = await AppDataSource.getRepository(Comment).findOneBy({id});
        if (!comment) {
            throw ApiError.badRequest('Comment is not found');
        }
        await AppDataSource.getRepository(PostComment).delete({ comment_id: id });
        await AppDataSource.getRepository(CommentReaction).delete({ comment_id: id });
        await AppDataSource.getRepository(Comment).remove(comment);
 
    }

    async updateComment(id, content) {
        const comment = await AppDataSource.getRepository(Comment).findOneBy({id});
        if (!comment) {
            throw ApiError.badRequest('Comment is not found');
        }
        comment.content = content;
        await AppDataSource.getRepository(Comment).save(comment);
        const author = await userService.getUser(comment.author_id);

        return new CommentDto(comment, author.login, author.profileImage, null);
    }

    async setCommentStatus(id, status) {
        const comment = await AppDataSource.getRepository(Comment).findOneBy({id});
        if (!comment) {
            throw ApiError.badRequest('Comment is not found');
        }
        comment.status = status;
        await AppDataSource.getRepository(Comment).save(comment);
        const author = await userService.getUser(comment.author_id);
        return new CommentDto(comment, author.login, author.profileImage, null);
    }
    
    async checkAuthor(commentId, authorId) {
        const comment = await AppDataSource.getRepository(Comment).findOneBy({id: commentId});
        if (!comment) {
            throw ApiError.badRequest('Comment is not found');
        }
        if (comment.author_id !== authorId) {
            throw ApiError.forbidden('User can change only his own comments.');
        }
    }

    async findAuthor(commentId) {
        const comment = await AppDataSource.getRepository(Comment).findOneBy({id: commentId});
    
        if (!comment) {
            throw ApiError.badRequest('Comment is not found');
        }
    
        const author = await userService.getUser(comment.author_id);
        return author;
      }

    async markAsAnswer(commentId, postId) {
        await this.checkMarkedPostComment(postId);

        const comment = await AppDataSource.getRepository(Comment).findOneBy({id: commentId});
        comment.marked_as_answer = true;
        await AppDataSource.getRepository(Comment).save(comment);

        const author = await userService.getUser(comment.author_id);
        return new CommentDto(comment, author.login, author.profileImage, postId);
    }

    async checkMarkedPostComment(postId) {
        const postComments = await AppDataSource.getRepository(PostComment)
          .createQueryBuilder("postcomment")
          .where("postcomment.post_id = :postId", { postId: postId })
          .select("postcomment.comment_id")
          .getMany();
      
        const commentIds = postComments.map((postComment) => postComment.comment_id);
        const comments = await AppDataSource.getRepository(Comment).findBy({ id: In(commentIds) });
      
        const hasMarkedAnswer = comments.some((comment) => comment.marked_as_answer);
      
        if (hasMarkedAnswer) {
          throw ApiError.badRequest('You already have a marked answer. To mark the new one, you need to remove the old marking.');
        }
      }

      async unmarkAnswer(commentId, postId) {
        const comment = await AppDataSource.getRepository(Comment).findOneBy({id: commentId});

        if(comment.marked_as_answer) {
            comment.marked_as_answer = false;
            await AppDataSource.getRepository(Comment).save(comment);
        } else {
            throw ApiError.badRequest('You cannot unmark this comment, because it is not marked as an answer.');
        }

        const author = await userService.getUser(comment.author_id);
        return new CommentDto(comment, author.login, author.profileImage, postId);
    }

}

module.exports = new CommentService();
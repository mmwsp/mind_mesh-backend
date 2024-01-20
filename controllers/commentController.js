const commentService = require("../services/comment-service");
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/apiError');
const reactionService = require("../services/reaction-service");
const postService = require("../services/post-service");

class CommentController {
    async createComment(req, res, next) {
        try {
            const postId = req.params.id;
            const {content, reply} = req.body;
            const authorId = req.user.id;
    
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest('Validation error', errors.array()));
            }
    
            const createdComment = await commentService.createComment(postId, content, authorId, reply);
            res.json(createdComment);
        } catch(e) {
            next(e);
        }
    }

    async getPostComments(req, res, next) {
        try {
            const postId = req.params.id;
            const comments = await commentService.getPostComments(postId);
            res.json(comments);
        } catch(e) {
            next(e);
        }
    }

    async deleteComment(req, res, next) {
        try {
            const id = req.params.id;
            const authorId = req.user.id;  

            await commentService.checkAuthor(id, authorId);
            await commentService.deleteComment(id);
            res.status(200).json({ 
                id: id,
                message: 'Comment is successfully removed'
             });
        } catch(e) {
            next(e);
        }
    }

    async updateComment(req, res, next) {
        try {
            const id = req.params.id;
            const { content } = req.body;
            const authorId = req.user.id;

            await commentService.checkAuthor(id,authorId);
            const updatedComment = await commentService.updateComment(id, content);
            res.json(updatedComment);
        } catch(e) {
            next(e);
        }
    }

    async createCommentReaction(req, res, next) {
        try {
            const commentId = req.params.id;
            const { reactionType } = req.body;
            const authorId = req.user.id;
            const reaction = await reactionService.createReactionComment(authorId, reactionType, commentId);
            res.json(reaction);
        } catch(e) {
            next(e);
        }
    }

    async deleteCommentReaction(req, res, next) {
        try {
            const commentId = req.params.id;
            const authorId = req.user.id;
            await reactionService.deleteCommentReaction(authorId, commentId);
            res.status(200).json({ message: 'Reaction is successfully removed' });
        } catch(e) {
            next(e);
        }
    }

    async getCommentReactions(req, res, next) {
        try {
            const commentId = req.params.id;
            const reactions = await reactionService.getCommentReactions(commentId);
            res.json(reactions);
        } catch(e) {
            next(e);
        }
    }

    async setCommentStatus(req, res, next) {
        try {
            const commentId = req.params.id;
            const { status } = req.body;
            const comment = await commentService.setCommentStatus(commentId, status);
            res.json(comment);
        } catch(e) {
            next(e);
        }

    }

    async checkReaction(req, res, next) {
        try {
            const commentId = req.params.id;
            const authorId = req.user.id;

            const reaction = await reactionService.checkCommentReaction(authorId, commentId);
            res.json(reaction);
        } catch(e) {
            next(e);
        }
    }

    async markAsAnswer(req, res, next) {
        try {
            const commentId = req.params.id;
            const authorId = req.user.id;
            const { postId } = req.body;

            await postService.checkAuthor(postId, authorId);
            const comment = await commentService.markAsAnswer(commentId, authorId, postId);
            res.json(comment);
        } catch(e) {
            next(e);
        }
    }

    async unmarkAnswer(req, res, next) {
        try {
            const commentId = req.params.id;
            const authorId = req.user.id;
            const { postId } = req.body;

            await postService.checkAuthor(postId, authorId);
            const comment = await commentService.unmarkAnswer(commentId, authorId, postId);
            res.json(comment);
        } catch(e) {
            next(e);
        }
    }
    
}

module.exports = new CommentController();
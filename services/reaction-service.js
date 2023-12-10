const  User  = require('../models/User');
const AppDataSource = require('../db_connection');
const uuid = require('uuid');  
const UserDto = require('../dtos/UserDto')
const ApiError = require('../exceptions/apiError');
const Post = require('../models/Post');
const Category = require('../models/Category');
const PostCategory = require('../models/PostCategory');
const PostDto = require('../dtos/PostDto');
const userService = require('./user-service');
const PostReaction = require('../models/PostReaction');
const Reaction = require('../models/Reaction');
const CommentReaction = require('../models/CommentReaction');
const Comment = require('../models/Comment');

class ReactionService {
    async getPostReactions(postId) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id: postId});
        if (!post) {
            throw ApiError.badRequest(`Post is not exist`);
        }
    
        const postReactions = await AppDataSource.getRepository(PostReaction)
            .createQueryBuilder("postreaction")
            .where("postreaction.post_id = :postId", { postId: postId })
            .select("postreaction.reaction_id")
            .getMany();
    
        const reactionIds = postReactions.map((postReaction) => postReaction.reaction_id);
    
        const reactions = await AppDataSource.getRepository(Reaction)
            .createQueryBuilder("reaction")
            .whereInIds(reactionIds)
            .select("reaction.type")
            .getMany();
    
        const reactionCounts = {
            likes: reactions.filter((reaction) => reaction.type === 'like').length,
            dislikes: reactions.filter((reaction) => reaction.type === 'dislike').length,
        };
    
        return reactionCounts;
    }


    async getCommentReactions(commentId) {
        const comm = await AppDataSource.getRepository(Comment).findOneBy({id: commentId});
        if (!comm) {
            throw ApiError.badRequest(`Reaction aborted, comment is not exist`);
        }

        const commReactions = await AppDataSource.getRepository(CommentReaction)
        .createQueryBuilder("commentreaction")
        .where("commentreaction.comment_id = :commentId", { commentId: commentId })
        .select("commentreaction.reaction_id")
        .getMany();

        const reactionIds = commReactions.map((commReaction) => commReaction.reaction_id);

        const reactions = await AppDataSource.getRepository(Reaction)
            .createQueryBuilder("reaction")
            .whereInIds(reactionIds)
            .select("reaction.type")
            .getMany();

        const reactionCounts = {
            likes: reactions.filter((reaction) => reaction.type === 'like').length,
            dislikes: reactions.filter((reaction) => reaction.type === 'dislike').length,
        };

        return reactionCounts;
    }

    
    async createReaction(author_id, type) {
        const author = await userService.getUser(author_id);
        const reaction = await AppDataSource.getRepository(Reaction).create({author_id: author.id, type});
        const savedReaction = await AppDataSource.getRepository(Reaction).save(reaction);
        return savedReaction;
    }


    async createReactionPost(author_id, type, post_id) {
        const existingReaction = await AppDataSource.getRepository(PostReaction)
            .createQueryBuilder("postreaction")
            .where("postreaction.post_id = :post_id AND postreaction.reaction_id IN (SELECT id FROM reaction WHERE author_id = :author_id)",
             { post_id, author_id })
            .getOne();
    
        if (existingReaction) {
            const existingReactionType = await AppDataSource.getRepository(Reaction)
                .createQueryBuilder("reaction")
                .where("reaction.id = :reaction_id", { reaction_id: existingReaction.reaction_id })
                .select("reaction.type")
                .getOne();

            if (existingReactionType.type !== type) {
                const updatedReaction = await AppDataSource.getRepository(Reaction).update({id: existingReaction.reaction_id}, { type });
                const reaction = await AppDataSource.getRepository(Reaction).findOneBy({id: existingReaction.reaction_id});
                return reaction;
            }
            const reaction = await AppDataSource.getRepository(Reaction).findOneBy({id: existingReaction.reaction_id});
            return reaction;

        } else {
            const post = await AppDataSource.getRepository(Post).findOneBy({id: post_id});

            if (!post) {
                throw ApiError.badRequest(`Reaction aborted, post is not exist`);
            }
            const reaction = await this.createReaction(author_id, type);
            const postReaction = await AppDataSource.getRepository(PostReaction).create({ post_id, reaction_id: reaction.id });
            await AppDataSource.getRepository(PostReaction).save(postReaction);
            return reaction;
        }
    }

    
    async createReactionComment(author_id, type, comment_id) {
        const existingReaction = await AppDataSource.getRepository(CommentReaction)
            .createQueryBuilder("commentreaction")
            .where("commentreaction.comment_id = :comment_id AND commentreaction.reaction_id IN (SELECT id FROM reaction WHERE author_id = :author_id)", 
            { comment_id, author_id })
            .getOne();

        if (existingReaction) {
            const existingReactionType = await AppDataSource.getRepository(Reaction)
                .createQueryBuilder("reaction")
                .where("reaction.id = :reaction_id", { reaction_id: existingReaction.reaction_id })
                .select("reaction.type")
                .getOne();

            if (existingReactionType.type !== type) {
                const updatedReaction = await AppDataSource.getRepository(Reaction).update({id: existingReaction.reaction_id}, { type });
                const reaction = await AppDataSource.getRepository(Reaction).findOneBy({id: existingReaction.reaction_id});
                return reaction;
            }

            const reaction = await AppDataSource.getRepository(Reaction).findOneBy({id: existingReaction.reaction_id});
            return reaction;

        } else {
            const comm = await AppDataSource.getRepository(Comment).findOneBy({id: comment_id});

            if (!comm) {
                throw ApiError.badRequest(`Reaction aborted, comment is not exist`);
            }
            
            const reaction = await this.createReaction(author_id, type);
            const commentReaction = await AppDataSource.getRepository(CommentReaction).create({ comment_id, reaction_id: reaction.id });
            await AppDataSource.getRepository(CommentReaction).save(commentReaction);

            return reaction;
        }
        
    }


    async deletePostReaction(author_id, post_id) {
        const existingReaction = await AppDataSource.getRepository(PostReaction)
            .createQueryBuilder("postreaction")
            .where("postreaction.post_id = :post_id AND postreaction.reaction_id IN (SELECT id FROM reaction WHERE author_id = :author_id)", { post_id, author_id })
            .getOne();
    
        if (existingReaction) {
            const reactionId = existingReaction.reaction_id;
    
            await AppDataSource.getRepository(PostReaction)
                .createQueryBuilder()
                .delete()
                .where("post_id = :post_id AND reaction_id = :reaction_id", { post_id, reaction_id: reactionId })
                .execute();
    
            await AppDataSource.getRepository(Reaction)
                .createQueryBuilder()
                .delete()
                .where("id = :reaction_id", { reaction_id: reactionId })
                .execute();
        } else {
            throw ApiError.badRequest(`Reaction is not exist`);
        }
    }


    async deleteCommentReaction(author_id, comment_id) {
        const existingReaction = await AppDataSource.getRepository(CommentReaction)
        .createQueryBuilder("commentreaction")
        .where("commentreaction.comment_id = :comment_id AND commentreaction.reaction_id IN (SELECT id FROM reaction WHERE author_id = :author_id)", 
        { comment_id, author_id })
        .getOne();

        if (existingReaction) {
            const reactionId = existingReaction.reaction_id;

            await AppDataSource.getRepository(CommentReaction)
                .createQueryBuilder()
                .delete()
                .where("comment_id = :comment_id AND reaction_id = :reaction_id", { comment_id, reaction_id: reactionId })
                .execute();

            await AppDataSource.getRepository(Reaction)
                .createQueryBuilder()
                .delete()
                .where("id = :reaction_id", { reaction_id: reactionId })
                .execute();
        } else {
            throw ApiError.badRequest(`Reaction is not exist`);
        }
    }

    async checkCommentReaction(authorId, commentId) {
        const reaction = await AppDataSource.getRepository(CommentReaction)
            .createQueryBuilder("commentreaction")
            .where("commentreaction.comment_id = :commentId AND commentreaction.reaction_id IN (SELECT id FROM reaction WHERE author_id = :authorId)",
            { commentId, authorId })
            .getOne();

        if (reaction) {
            const reactionType = await AppDataSource.getRepository(Reaction)
                .createQueryBuilder("reaction")
                .where("reaction.id = :reactionId", { reactionId: reaction.reaction_id })
                .select("reaction.type")
                .getOne();

            return { reactionType: reactionType.type };
        } else {
            return { reactionType: null };
        }
    }

    async checkPostReaction(authorId, postId) {
        const reaction = await AppDataSource.getRepository(PostReaction)
        .createQueryBuilder("postreaction")
        .where("postreaction.post_id = :postId AND postreaction.reaction_id IN (SELECT id FROM reaction WHERE author_id = :authorId)", { postId, authorId })
        .getOne();

        if (reaction) {
            const reactionType = await AppDataSource.getRepository(Reaction)
                .createQueryBuilder("reaction")
                .where("reaction.id = :reactionId", { reactionId: reaction.reaction_id })
                .select("reaction.type")
                .getOne();

            return { reactionType: reactionType.type };
        } else {
            return { reactionType: null };
        }
    }
    
}


module.exports = new ReactionService();
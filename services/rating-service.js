const commentService = require("./comment-service");
const postService = require("./post-service");
const reactionService = require("./reaction-service");
const userService = require("./user-service");


class RatingService {
    async rateAnswerAuthor(commentId) {
        const author = await commentService.findAuthor(commentId);
        await userService.updateUserRating(author.id, 10);
    }

    async unrateAnswerAuthor(commentId) {
        const author = await commentService.findAuthor(commentId);
        await userService.updateUserRating(author.id, -10);
    }

    async rateCommentAuthor(reactionType, commentId) {
        const author = await commentService.findAuthor(commentId);

        if(reactionType === "like") {
            await userService.updateUserRating(author.id, 2);
        } else if(reactionType === "dislike") {
            await userService.updateUserRating(author.id, -1);
        }
    }

    async unrateCommentAuthor(commentId) {
        const author = await commentService.findAuthor(commentId);
        const reaction = await reactionService.checkCommentReaction(author.id, commentId);

        if(reaction.reactionType === "like") {
            await userService.updateUserRating(author.id, -2);
        } else if(reaction.reactionType === "dislike") {
            await userService.updateUserRating(author.id, 1);
        }
    }

    async ratePostAuthor(reactionType, postId) {
        const author = await postService.findAuthor(postId);

        if(reactionType === "like") {
            await userService.updateUserRating(author.id, 3);
        } else if(reactionType === "dislike") {
            await userService.updateUserRating(author.id, -2);
        }
    }

    async unratePostAuthor(postId) {
        const author = await postService.findAuthor(postId);
        const reaction = await reactionService.checkPostReaction(author.id, postId);

        if(reaction.reactionType === "like") {
            await userService.updateUserRating(author.id, -3);
        } else if(reaction.reactionType === "dislike") {
            await userService.updateUserRating(author.id, 2);
        }
    }

}

module.exports = new RatingService();
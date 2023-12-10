const postService = require("../services/post-service");
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/apiError');
const cheerio = require('cheerio');
const reactionService = require("../services/reaction-service");
const imageDirectory = 'userFiles';

class PostController {
    async createPost(req, res, next) {
        try {
            const {title, content, author_id, categories} = req.body;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.badRequest('Validation error', errors.array()));
            }

            const uniqueId = Date.now().toString();
            const $ = cheerio.load(content);
          
            $('img').each((index, element) => {
                const imgSrc = $(element).attr('src');
                if (imgSrc && imgSrc.startsWith('data:image/')) {
                  const matches = imgSrc.match(/^data:image\/(jpeg|jpg|png|gif);base64,([\s\S]+)/);
                  if (matches && matches.length === 3) {
                    const imgExtension = matches[1];
                    const imgData = matches[2];
                    const imgBinaryData = atob(imgData);
                    const imgFilename = `${uniqueId}_${index}.${imgExtension}`;

                    fs.writeFileSync(`${imageDirectory}/${imgFilename}`, imgBinaryData, 'binary');
                    $(element).attr('src', `${process.env.API_URL}/${imageDirectory}/${imgFilename}`);
                  }
                }
              });
            const updatedContent = $.html();
            const createdPost = await postService.createPost(title, updatedContent, author_id, categories); 
  
            res.json(createdPost);
        } catch(e) {
            next(e);
        }
    }

    async getActivePosts(req, res, next) {
        try {
            const posts = await postService.getActivePosts();
            res.json(posts);
        } catch(e) {
            next(e);
        }
    }

    async getAllPosts(req, res, next) {
        try {
            const posts = await postService.getAllPosts();
            res.json(posts);
        } catch(e) {
            next(e);
        }
    }

    async getUserPosts(req, res, next) {
        try {
            const userId = req.params.id;;
            const posts = await postService.getUserPosts(userId);

            if(!posts) {
                return res.status(200).json({ message: "User has no posts", posts: [] });
            }
            
            res.json(posts);
        } catch(e) {
            next(e);
        }
    }

    async getUserActivePosts(req, res, next) {
        try {
            const userId = req.params.id;;
            const posts = await postService.getUserActivePosts(userId);

            if(!posts) {
                return res.status(200).json({ message: "User has no posts", posts: [] });
            }
            
            res.json(posts);
        } catch(e) {
            next(e);
        }
    }

    async getPost(req, res, next) {
        try {
            const id = req.params.id;
            const post = await postService.getPost(id);
            res.json(post);
        } catch(e) {
            next(e);
        }
    }

    async deletePost(req, res, next) {
        try {
            const id = req.params.id;
            await postService.deletePost(id);
            res.status(200).json({ id: id,
                message: 'Post is successfully removed' });
        } catch(e) {
            next(e);
        }
    }

    async updatePost(req, res, next) {
        try {
            const postId = req.params.id;
            const updatedFields = req.body;
            const authorId = req.user.id;

            await postService.checkAuthor(postId, authorId);

           if (!postId || !updatedFields) {
                throw ApiError.badRequest('Invalid update data');
            }
            const updatedPost = await postService.updatePost(postId, updatedFields);
            res.json(updatedPost);
        } catch(e) {
            next(e);
        }
    }

    async updatePostByAdmin(req, res, next) {
        try {
            const id = req.params.id;
            const updatedFields = req.body;
    
            if (!id || !updatedFields) {
                throw ApiError.badRequest('Invalid update data');
            }
            const updatedPost = postService.updatePost(id, updatedFields);
    
            res.json(updatedPost);
        } catch(e) {
            next(e);
        }
    }

    async getPostReactions(req, res, next) {
        try {
            const postId = req.params.id;
            const reactions = await reactionService.getPostReactions(postId);
            res.json(reactions);
        } catch(e) {
            next(e);
        }
    }

    async createPostReaction(req, res, next) {
        try {
            const postId = req.params.id;
            const { reactionType } = req.body;
            const authorId = req.user.id;
            const reaction = await reactionService.createReactionPost(authorId, reactionType, postId);
            res.json(reaction);
        } catch(e) {
            next(e);
        }
    }

    async deletePostReaction(req, res, next) {
        try {
            const postId = req.params.id;
            const authorId = req.user.id;
            await reactionService.deletePostReaction(authorId, postId);
            res.status(200).json({ message: 'Reaction is successfully removed' });
        } catch(e) {
            next(e);
        }
    }

    async checkReaction(req, res, next) {
        try {
            const postId = req.params.id;
            const authorId = req.user.id;

            const reaction = await reactionService.checkPostReaction(authorId, postId);

            res.json(reaction);
        } catch(e) {
            next(e);
        }
    }

}

module.exports = new PostController();
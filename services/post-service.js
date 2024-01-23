const  User  = require('../models/User');
const AppDataSource = require('../db_connection');
const uuid = require('uuid');  
const UserDto = require('../dtos/UserDto')
const ApiError = require('../exceptions/apiError');
const Post = require('../models/Post');
const Category = require('../models/Category');
const PostCategory = require('../models/PostCategory');
const PostComment = require('../models/PostComment');
const PostDto = require('../dtos/PostDto');
const userService = require('./user-service');
const PostForListDto = require('../dtos/PostForListDto');
const reactionService = require('./reaction-service');
const PostReaction = require('../models/PostReaction');

class PostService {
    async createPost(title, content, author_id, categories) {
        const categoryArray = categories.split(', ').map(category => category.trim());
        const newPost = await AppDataSource.getRepository(Post).create({content, author_id, title});
        const savedPost = await AppDataSource.getRepository(Post).save(newPost);
        const postId = savedPost.id;

        for (const categoryName of categoryArray) {
            let category = await AppDataSource.getRepository(Category).findOneBy({ title: categoryName });
          
            if (!category) {
                return next(ApiError.badRequest("Incorrect category"));
            } else {
                const postCategory = await AppDataSource.getRepository(PostCategory).create({ post_id: postId, category_id: category.id });
                await AppDataSource.getRepository(PostCategory).save(postCategory);
            }
        }
        const author = await userService.getUser(author_id);
        const postDto = new PostDto(savedPost, author.fullname, author.profileImage, categories);
        return postDto;
    }

    async getAllPosts() {
        const posts = await AppDataSource.getRepository(Post).find();
        const postDTOs = await Promise.all(posts.map(async (post) => {
            const author = await userService.getUser(post.author_id);
            const reactions = await reactionService.getPostReactions(post.id);
            const categoryIds = await AppDataSource.getRepository(PostCategory)
                .createQueryBuilder("postcategory")
                .where("postcategory.post_id = :postId", { postId: post.id })
                .select("postcategory.category_id")
                .getMany();
    
            const categories = await AppDataSource.getRepository(Category)
                .createQueryBuilder("category")
                .whereInIds(categoryIds.map((categoryId) => categoryId.category_id))
                .select("category.title")
                .getMany();

            return new PostForListDto(post, post.content.slice(0, 100), author.fullname, author.profileImage, categories.map((category) => category.title), reactions);
        }));
    
        return postDTOs;
    }

    async getActivePosts() {
        const posts = await AppDataSource.getRepository(Post).findBy({status: "active"});
        const postDTOs = await Promise.all(posts.map(async (post) => {
            const author = await userService.getUser(post.author_id);
            const reactions = await reactionService.getPostReactions(post.id);
            const categoryIds = await AppDataSource.getRepository(PostCategory)
                .createQueryBuilder("postcategory")
                .where("postcategory.post_id = :postId", { postId: post.id })
                .select("postcategory.category_id")
                .getMany();
    
            const categories = await AppDataSource.getRepository(Category)
                .createQueryBuilder("category")
                .whereInIds(categoryIds.map((categoryId) => categoryId.category_id))
                .select("category.title")
                .getMany();
    
            return new PostForListDto(post, post.content.slice(0, 100), author.fullname, author.profileImage, categories.map((category) => category.title), reactions);
        }));
    
        return postDTOs;
    }

    async getUserPosts(userId) {
        const user = await userService.getUser(userId);
        const posts = await AppDataSource.getRepository(Post).findBy({ author_id: userId });

        if(!posts) {
            return null;
        }

        const postDTOs = await Promise.all(posts.map(async (post) => {
            const reactions = await reactionService.getPostReactions(post.id);
            const categoryIds = await AppDataSource.getRepository(PostCategory)
            .createQueryBuilder("postcategory")
            .where("postcategory.post_id = :postId", { postId: post.id })
            .select("postcategory.category_id")
            .getMany();

            const categories = await AppDataSource.getRepository(Category)
                .createQueryBuilder("category")
                .whereInIds(categoryIds.map((categoryId) => categoryId.category_id))
                .select("category.title")
                .getMany();
    
            return new PostDto(post, user.fullname, user.profileImage, categories.map((category) => category.title), reactions);
        }));

        return postDTOs;
    }

    async getUserActivePosts(userId) {
        const user = await userService.getUser(userId);
        const posts = await AppDataSource.getRepository(Post).findBy({ author_id: userId, status: 'active' });

        if(!posts) {
            return null;
        }

        const postDTOs = await Promise.all(posts.map(async (post) => {
            const reactions = await reactionService.getPostReactions(post.id);
            const categoryIds = await AppDataSource.getRepository(PostCategory)
            .createQueryBuilder("postcategory")
            .where("postcategory.post_id = :postId", { postId: post.id })
            .select("postcategory.category_id")
            .getMany();

            const categories = await AppDataSource.getRepository(Category)
                .createQueryBuilder("category")
                .whereInIds(categoryIds.map((categoryId) => categoryId.category_id))
                .select("category.title")
                .getMany();
    
            return new PostDto(post, user.fullname, user.profileImage, categories.map((category) => category.title), reactions);
        }));

        return postDTOs;
    }

    async getPost(id) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id});
        if (!post) {
            throw ApiError.badRequest(`Post is not exist`);
        }
        const categoryIds = await AppDataSource.getRepository(PostCategory)
        .createQueryBuilder("postcategory")
        .where("postcategory.post_id = :postId", { postId: post.id })
        .select("postcategory.category_id")
        .getMany();

        const categories = await AppDataSource.getRepository(Category)
        .createQueryBuilder("category")
        .whereInIds(categoryIds.map((categoryId) => categoryId.category_id))
        .select("category.title")
        .getMany();

        const author = await userService.getUser(post.author_id);
        const reactions = await reactionService.getPostReactions(id);
        return new PostDto(post, author.fullname, author.profileImage, categories.map((category) => category.title), reactions);
    }

    async deletePost(id) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id});
        if (!post) {
            throw ApiError.badRequest('Post is not found');
        }
        await AppDataSource.getRepository(PostCategory).delete({ post_id: id });
        await AppDataSource.getRepository(PostComment).delete({ post_id: id });
        await AppDataSource.getRepository(PostReaction).delete({ post_id: id });
        await AppDataSource.getRepository(Post).remove(post);
    }

    async checkAuthor(postId, authorId) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id: postId});
        if (!post) {
            throw ApiError.badRequest('Post is not found');
        }
        if (post.author_id !== authorId) {
            throw ApiError.forbidden('User can change only his own posts.');
        }
    }

    async findAuthor(postId) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id: postId});
    
        if (!post) {
            throw ApiError.badRequest('Post is not found');
        }
    
        const author = await userService.getUser(post.author_id);
        return author;
      }


    async updatePost(id, updatedFields) {
        const post = await AppDataSource.getRepository(Post).findOneBy({id});
        if (!post) {
            throw ApiError.badRequest('Post is not found');
        }
        if (updatedFields.content) {
            post.content = updatedFields.content;
        }
        if (updatedFields.title) {
            post.title = updatedFields.title;
        }
        if (updatedFields.status) {
            post.status = updatedFields.status;
        }
        const updatedPost = await AppDataSource.getRepository(Post).save(post);
        const postDto = new PostDto(updatedPost);
        return postDto;
    }

}

module.exports = new PostService();
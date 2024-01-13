const  User  = require('../models/User');
const AppDataSource = require('../db_connection');
const bcrypt = require('bcrypt')
const uuid = require('uuid');  
const mailService = require('./mail-service');
const tokenService = require('./token-service')
const UserDto = require('../dtos/UserDto')
const ApiError = require('../exceptions/apiError');
const Post = require('../models/Post');
const Tokens = require('../models/Tokens');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');

class UserService {
    async getUsers() {
        const users = await AppDataSource.getRepository(User).find();
        const userDTOs = users.map(user => new UserDto(user));
        return userDTOs;
    }

    async getUser(id) {
        const user = await AppDataSource.getRepository(User).findOneBy({id});
        if(!user) {
            throw ApiError.badRequest(`User is not exist.`);
        }
        const userDto = new UserDto(user);
        return userDto;
    }

    async createUser(login, password, email, role, fullname) {
        const candidateEmail = await AppDataSource.getRepository(User).findOneBy({ email: email, });
        const candidateLogin =await AppDataSource.getRepository(User).findOneBy({ login: login, });
        if (candidateEmail) {
            throw ApiError.badRequest(`User with ${email} is already exist.`);
        } else if (candidateLogin) {
            throw ApiError.badRequest(`User with this username (${username}) is already exist.`);
        }
        if(!role) {
            role = "user";
        }
        const email_confirmed = true;
        const hashPassword = await bcrypt.hash(password, 3);
        const user = await AppDataSource.getRepository(User).create({login, password: hashPassword, email, role, fullname, email_confirmed});
        await AppDataSource.getRepository(User).save(user);
        const userDto = new UserDto(user);
        return userDto;
    }

    async updateUser(id, updatedFields) {
        const user = await AppDataSource.getRepository(User).findOneBy({id});
        if (!user) {
            throw ApiError.badRequest('User is not found');
        }
        if (updatedFields.fullname) {
            user.fullname = updatedFields.fullname;
        }
        if (updatedFields.email) {
            user.email = updatedFields.email;
        }
        if (updatedFields.login) {
            user.login = updatedFields.login;
        }
        if (updatedFields.rating) {
            user.rating = user.rating + updatedFields.rating;
        }
        const updatedUser = await AppDataSource.getRepository(User).save(user);
        const userDto = new UserDto(updatedUser);
        return userDto;
    }

    async deleteUser(id) {
        const user = await AppDataSource.getRepository(User).findOneBy({id});
        if (!user) {
            throw ApiError.badRequest('User is not found');
        }

        await AppDataSource.getRepository(Post).createQueryBuilder()
        .delete()
        .where("author_id = :userId", { userId: user.id })
        .execute();


    await AppDataSource.getRepository(Comment).createQueryBuilder()
        .delete()
        .where("author_id = :userId", { userId: user.id })
        .execute();

 
    await AppDataSource.getRepository(Tokens).createQueryBuilder()
        .delete()
        .where("user_id = :userId", { userId: user.id })
        .execute();


    await AppDataSource.getRepository(Reaction).createQueryBuilder()
        .delete()
        .where("author_id = :userId", { userId: user.id })
        .execute();

        await AppDataSource.getRepository(User).remove(user);
    }

    async uploadUserPhoto(id, photoPath) {
        const user = await AppDataSource.getRepository(User).findOneBy({id});

        if (!user) {
            throw ApiError.badRequest('User is not found');
        }
        user.profile_image = photoPath;
        const updatedUser = await AppDataSource.getRepository(User).save(user);
        const userDto = new UserDto(updatedUser);

        return userDto;
    }

    async deleteUserPhoto(id) {
        const user = await AppDataSource.getRepository(User).findOneBy({id});

        if (!user) {
            throw ApiError.badRequest('User is not found');
        }

        user.profile_image = null;
        const updatedUser = await AppDataSource.getRepository(User).save(user);
        const userDto = new UserDto(updatedUser);

        return userDto;
    }

    async changePass(id, passwords) {
        const user = await AppDataSource.getRepository(User).findOneBy({id});

        if(!user) {
            throw ApiError.badRequest(`User is not exist.`);
        }

        if(!passwords.newPassword || !passwords.oldPassword) {
            throw ApiError.badRequest('Incorrect passwords data');
        }

        const isPassEquals = await bcrypt.compare(passwords.oldPassword, user.password); 
        if(!isPassEquals) {
            throw ApiError.badRequest('Invalid old password');
        }

        const hashNewPassword = await bcrypt.hash(passwords.newPassword, 3);
        user.password = hashNewPassword;
        await AppDataSource.getRepository(User).save(user);

    }
}

module.exports = new UserService();
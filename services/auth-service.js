const  User  = require('../models/User');
const AppDataSource = require('../db_connection');
const bcrypt = require('bcrypt')
const uuid = require('uuid');  
const mailService = require('./mail-service');
const tokenService = require('./token-service')
const UserDto = require('../dtos/UserDto')
const ApiError = require('../exceptions/apiError')

class AuthServiсe {

    async registration(login, password, email, fullname) {
        const candidateEmail = await AppDataSource.getRepository(User).findOneBy({ email: email, });
        const candidateLogin =await AppDataSource.getRepository(User).findOneBy({ login: login, });
        if (candidateEmail) {
            throw ApiError.badRequest(`User with ${email} is already exist.`);
        } else if (candidateLogin) {
            throw ApiError.badRequest(`User with this username (${username}) is already exist.`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await AppDataSource.getRepository(User).create({login, password: hashPassword, email, fullname, activation_link: activationLink});
        const resUser = await AppDataSource.getRepository(User).save(user);
        await mailService.sendActivationLink(`${process.env.API_URL}/api/auth/activate/${activationLink}`, email);

        const userDto = new UserDto(resUser);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await AppDataSource.getRepository(User).findOneBy({ activation_link: activationLink, })
        if (!user) {
            throw ApiError.badRequest("Incorrect activation link");
        }
        user.email_confirmed = true;
        await AppDataSource.getRepository(User).save(user);
    }

    async login(email, password) {
        const user = await AppDataSource.getRepository(User).findOneBy({ email: email, });
        if (!user) {
            throw ApiError.badRequest('User with this email was not found');
        } else if (user.email_confirmed === false) {
            throw ApiError.forbidden('Email is not confirmed');
        }
        const isPassEquals = await bcrypt.compare(password, user.password); 
        if(!isPassEquals) {
            throw ApiError.badRequest('Invalid password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.unauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findTokenInDB(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.unauthorizedError()
        }
        const user = await AppDataSource.getRepository(User).findOneBy({ id: userData.id, });
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }

    }

    async passwordResetEmailSend(email) {
        const user = await AppDataSource.getRepository(User).findOneBy({ email: email, });
        if(!user) {
            throw ApiError.badRequest('User with this email was not found');
        }
        const timestamp = Date.now();
        const resetLink = `${uuid.v4()}_${timestamp}`;
        user.reset_password_link = resetLink;
        await AppDataSource.getRepository(User).save(user);
        await mailService.sendResetLink(`${process.env.API_URL}/api/auth/password-reset/${resetLink}`, email);
    }

    async passwordReset(resetLink, newPassword) {
        const parts = resetLink.split('_');
        const user = await AppDataSource.getRepository(User).findOneBy({ reset_password_link: resetLink, });

        if (parts.length !== 2) {
            throw ApiError.badRequest("Invalid reset link format");
        }
        if (!user) {
            throw ApiError.badRequest("Invalid reset link");
        }

        const timestamp = parseInt(parts[1]);
        const currentTime = Date.now();
        const expirationTime = timestamp + (5 * 60 * 1000);
    
        if (currentTime > expirationTime) {
            throw ApiError.badRequest("Password reset link has expired");
        }
    
        const hashPassword = await bcrypt.hash(newPassword, 3);
        user.password = hashPassword;
        user.reset_password_link = null;
        await AppDataSource.getRepository(User).save(user);
    }


}

module.exports = new AuthServiсe();
const jwt = require('jsonwebtoken')
const Token = require('../models/Tokens')
const AppDataSource = require('../db_connection');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {expiresIn:'7m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn:'7d'});
        return {
            accessToken,
            refreshToken
        };
    }
    
    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
            return userData;
        } catch (e){
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
            return userData;
        } catch (e){
            return null;
        }
    }

     async findTokenInDB(token) {
        const result =  await AppDataSource.getRepository(Token).findOneBy({
            refresh_token: token,
        });
        return result;
    }


    async saveToken(userId, refreshToken) {
        const tokenData = await AppDataSource.getRepository(Token).findOneBy({
            user_id: userId,
        });
        if (tokenData) {
            tokenData.refresh_token = refreshToken;
            const res = await AppDataSource.getRepository(Token).save(tokenData);
            return res;
        }
        const token = await AppDataSource.getRepository(Token).create({ user_id: userId, refresh_token: refreshToken });
        const tokenResult = await AppDataSource.getRepository(Token).save(token);
        return tokenResult;
    }

    async removeToken(refreshToken) {
        const tokenData = await AppDataSource.getRepository(Token).delete({refresh_token: refreshToken});
        return tokenData
    }

}

module.exports = new TokenService()
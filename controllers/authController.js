const authService = require("../services/auth-service");
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/apiError');

class AuthController {
    async registration(req, res, next) {
        try {
            const {login, password, email, fullname} = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest('Validation error', errors.array()));
            }
            const userData = await authService.registration(login, password, email, fullname);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 15 * 24 * 60 * 60 * 1000, 
                secure: true,
                sameSite: 'none',
                httpOnly: true
            });
            return res.json(userData);
        } catch(e) {
            next(e);
        }
    }
    
    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await authService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await authService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 15 * 24 * 60 * 60 * 1000, 
                secure: true,
                sameSite: 'none',
                httpOnly: true
            });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await authService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const userData = await authService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 15 * 24 * 60 * 60 * 1000, 
                secure: true,
                sameSite: 'none',
                httpOnly: true
            })
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async passwordResetEmailSend(req, res, next) {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest('Validation error', errors.array()));
            }
    
            const email = req.body.email;
            await authService.passwordResetEmailSend(email);
            res.status(200).json({ message: 'Password-reset email sent successfully' });
        } catch(e) {
            next(e);
        }
    }

    async passwordReset(req, res, next) {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest('Validation error', errors.array()));
            }
    
            const resetLink = req.params.link;
            const newPassword = req.body.newPassword;
            await authService.passwordReset(resetLink, newPassword);
            res.status(200).json({ message: 'Password was successfully changed' });
        } catch(e) {
            next(e);
        }
    }

}

module.exports = new AuthController();
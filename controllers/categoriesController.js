const commentService = require("../services/comment-service");
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/apiError');
const reactionService = require("../services/reaction-service");
const categoriesService = require("../services/categories-service");

class CategoriesController {
    async getCategories(req, res, next) {
        try {
            const categories = await categoriesService.getCategories();
            res.json(categories);
        } catch(e) {
            next(e);
        }
    }
}

module.exports = new CategoriesController();
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

    async createCategory(req, res, next) { 
        try {
            const {title, description} = req.body;
            const category = await categoriesService.createCategory(title, description);
            res.json(category);
        } catch(e) {
            next(e);
        }
    }


    async changeCategory(req, res, next) { 
        try {
            const {categoryId, newTitle, newDescription} = req.body;
            const category = await categoriesService.changeCategory(categoryId, newTitle, newDescription);
            res.json(category);
        } catch(e) {
            next(e);
        }
    }

    async deleteCategory(req, res, next) { 
        try {
            const categoryId = req.params.id;
            await categoriesService.deleteCategory(categoryId);
            res.status(200).json({ message: 'Category is successfully removed' });
        } catch(e) {
            next(e);
        }
    }
}

module.exports = new CategoriesController();
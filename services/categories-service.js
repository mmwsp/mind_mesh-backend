const AppDataSource = require('../db_connection');
const CategoryDto = require('../dtos/CategoryDto');
const Category = require('../models/Category');

class CategoriesService {
    async getCategories() {
        const categories = await AppDataSource.getRepository(Category).find();
        const categoryDtos = categories.map(category => new CategoryDto(category.id, category.title));
        return categoryDtos;
    }

}

module.exports = new CategoriesService()
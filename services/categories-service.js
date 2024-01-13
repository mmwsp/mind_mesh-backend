const AppDataSource = require('../db_connection');
const CategoryDto = require('../dtos/CategoryDto');
const Category = require('../models/Category');
const PostCategory = require('../models/PostCategory');

class CategoriesService {
    async getCategories() {
        const categories = await AppDataSource.getRepository(Category).find();
        const categoryDtos = categories.map(category => new CategoryDto(category.id, category.title));
        return categoryDtos;
    }

    async createCategory(title, description) {
        const check = await AppDataSource.getRepository(Category).findOneBy({title});
        if(check) {
            throw ApiError.badRequest('Category exists already.');
        }
        else {
            const newCategory = await AppDataSource.getRepository(Category).create({title, description});
            return new CategoryDto(newCategory.id, newCategory.title);
        }

    }

    async changeCategory(categoryId, newTitle, newDescription) {
        const category = await AppDataSource.getRepository(Category).findOneBy({id: categoryId});

        if (!category) {
            throw ApiError.badRequest('Category is not found');
        }

        category.title = newTitle;
        category.description = newDescription;
        const updatedCategory = await AppDataSource.getRepository(Category).save(category);
        return new CategoryDto(updatedCategory.id, updatedCategory.title);
        
    }

    async deleteCategory(categoryId) {
        const category = await AppDataSource.getRepository(Category).findOneBy({id: categoryId});

        if (!category) {
            throw ApiError.badRequest('Category is not found');
        }

        await AppDataSource.getRepository(PostCategory).delete({category_id: categoryId});
        await AppDataSource.getRepository(Category).remove(category);
    }

}

module.exports = new CategoriesService()
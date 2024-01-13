const Router = require('express').Router;
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const categoriesController = require('../controllers/categoriesController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const router = new Router()

router.get('/', categoriesController.getCategories);
router.patch('/', authMiddleware, adminMiddleware, categoriesController.changeCategory);
router.post('/', authMiddleware, adminMiddleware, categoriesController.createCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoriesController.deleteCategory);

module.exports = router;
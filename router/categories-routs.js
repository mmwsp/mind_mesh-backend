const Router = require('express').Router;
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const categoriesController = require('../controllers/categoriesController');
const router = new Router()

router.get('/', categoriesController.getCategories);


module.exports = router;
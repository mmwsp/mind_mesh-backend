const Router = require('express').Router;
const userController = require('../controllers/userController');
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const router = new Router();

router.post('/user/create', 
    authMiddleware,
    adminMiddleware,
    body('email').isEmail(),
    body('login').isLength({min: 3, max: 18}),
    body('password').isLength({min: 4, max: 25}),  userController.createUser);

router.patch('/post/:id', authMiddleware, adminMiddleware, postController.updatePostByAdmin);
router.patch('/comment/:id', authMiddleware, adminMiddleware, commentController.setCommentStatus);
router.get('/post', authMiddleware, adminMiddleware, postController.getAllPosts);

module.exports = router;
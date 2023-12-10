const Router = require('express').Router
const postController = require('../controllers/postController')
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware')
const router = new Router()

router.post('/',
    authMiddleware,
    body('title').isLength({ min: 4 }),
    body('content').isLength({ min: 7 }),  postController.createPost);

router.get('/', postController.getActivePosts);
router.get('/:id', postController.getPost);
router.get('/:id/reaction', postController.getPostReactions);
router.get('/user/:id', postController.getUserPosts);
router.get('/user-active/:id', postController.getUserActivePosts);
router.get('/check-reaction/:id', authMiddleware, postController.checkReaction);
router.post('/:id/reaction', authMiddleware, postController.createPostReaction);
router.patch('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.delete('/:id/reaction', authMiddleware, postController.deletePostReaction);

module.exports = router;
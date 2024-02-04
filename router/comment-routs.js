const Router = require('express').Router
const commentController = require('../controllers/commentController')
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware')
const router = new Router()

router.post('/post/:id',
    authMiddleware,
    body('content').isLength({ min: 1 }), authMiddleware, commentController.createComment);
router.post('/:id/reaction', authMiddleware, commentController.createCommentReaction);
router.post('/mark/:id', authMiddleware, commentController.markAsAnswer);
router.post('/unmark/:id', authMiddleware, commentController.unmarkAnswer);

router.get('/post/:id', commentController.getPostComments);
router.get('/:id/reaction', commentController.getCommentReactions);
router.get('/check-reaction/:id', authMiddleware, commentController.checkReaction)

router.patch('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.delete('/:id/reaction', authMiddleware, commentController.deleteCommentReaction);


module.exports = router;
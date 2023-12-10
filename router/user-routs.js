const Router = require('express').Router;
const userController = require('../controllers/userController');
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const router = new Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.patch('/update', authMiddleware, userController.updateUser);
router.patch('/avatar', authMiddleware, userController.uploadUsersAvatar);
router.post('/changepass', authMiddleware, userController.changePass)
router.delete('/', authMiddleware, userController.deleteUser);
router.delete('/:id', authMiddleware, userController.deleteUserAdm);

module.exports = router;
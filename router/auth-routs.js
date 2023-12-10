const Router = require('express').Router;
const authController = require('../controllers/authController');
const {body} = require('express-validator');
const router = new Router();

router.post('/register',
    body('email').isEmail(),
    body('login').isLength({min: 3, max: 18}),
    body('password').isLength({min: 4, max: 25}), 
    authController.registration);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/password-reset', 
    body('email').isEmail(), 
    authController.passwordResetEmailSend);
router.post('/password-reset/:link', 
    body('newPassword').isLength({min: 4, max: 25}), 
    authController.passwordReset);
router.get('/refresh', authController.refresh);
router.get('/activate/:link', authController.activate);

module.exports = router;
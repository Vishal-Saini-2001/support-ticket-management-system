const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authRateLimiter } = require('../middlewares/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);

module.exports = router;


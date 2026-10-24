const router = require('express').Router();
const { register, login, getMe, updateProfile, registerRules, loginRules } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

module.exports = router;

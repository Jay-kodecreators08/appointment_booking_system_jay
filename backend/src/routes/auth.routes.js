const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerValidator, validate, controller.register);
router.post('/login', loginValidator, validate, controller.login);
router.post('/admin-login', loginValidator, validate, controller.adminLogin);
router.get('/me', authenticateToken, controller.me);

module.exports = router;

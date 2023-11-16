const express = require('express');
const isAuth = require('../middleware/is-auth');

const authControllers = require('../controllers/auth');
const authValidators = require('../validators/authValidators');

const router = express.Router();

router.post('/signup', authValidators.signup , authControllers.postSignup);

router.put('/signin', authControllers.postSignin);

router.get('/codeforces', authControllers.hasCodeforces);

module.exports = router;

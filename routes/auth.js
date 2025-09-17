const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

// Login/Logout
router.get('/login',  auth.showLogin);
router.post('/login', auth.login);
router.get('/logout', auth.logout);

// Alleen admin mag accounts aanmaken
router.get('/register', auth.requireRole('admin'), auth.showRegister);
router.post('/register', auth.requireRole('admin'), auth.register);

module.exports = router;

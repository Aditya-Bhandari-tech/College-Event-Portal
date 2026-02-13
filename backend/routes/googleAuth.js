
const express = require('express');
const router = express.Router();
const { googleAuth, checkGoogleUser } = require('../controllers/googleAuthController');

// Check if user exists
router.post('/google/check', checkGoogleUser);

// Google authentication (login/signup)
router.post('/google', googleAuth);

module.exports = router;
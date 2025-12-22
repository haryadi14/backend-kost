const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Jalur URL untuk Autentikasi
router.post('/register', authController.register); // Mendaftarkan user baru
router.post('/login', authController.login);       // Login user

module.exports = router;
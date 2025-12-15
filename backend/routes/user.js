// backend/routes/user.js
const express = require('express');

// Router Express pour les routes des utilisateurs
const router = express.Router();

// Importer le contrôleur des utilisateurs
const userCtrl = require('../controllers/user');

// Routes pour les utilisateurs
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;

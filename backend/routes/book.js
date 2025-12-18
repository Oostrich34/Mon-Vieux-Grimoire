// backend/routes/book.js
const express = require('express');

// Router Express pour les routes des livres
const router = express.Router();

// Importer le middleware d'authentification et de gestion des fichiers
const auth = require('../middleware/auth');

// Importer le middleware de gestion des fichiers (Multer)
const { upload, processImage } = require('../middleware/multer-config');

// Importer le contrôleur des livres
const bookCtrl = require('../controllers/book');

// Routes pour les livres
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, upload, processImage, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.put('/:id', auth, upload, processImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;

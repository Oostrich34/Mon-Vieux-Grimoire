const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !')) // eslint-disable-line no-console
  .catch((err) => console.log('Connexion à MongoDB échouée !', err)); // eslint-disable-line no-console

// Initialisation de l'application Express
const app = express();

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Activer CORS pour toutes les routes
app.use(cors());

// Configuration des en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Routes de l'application
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;

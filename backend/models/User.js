const mongoose = require('mongoose');

// Schéma Mongoose pour les utilisateurs
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Gestion des erreurs de duplication d'email
userSchema.post(['save', 'findOneAndUpdate', 'insertMany'], (error, doc, next) => {
  if (error && error.code === 11000) {
    next(new Error('Cet email est déjà utilisé.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);

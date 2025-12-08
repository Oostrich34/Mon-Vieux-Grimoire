const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Middleware d'erreur d'unicité sans "return"
userSchema.post(['save', 'findOneAndUpdate', 'insertMany'], (error, doc, next) => {
  if (error && error.code === 11000) {
    next(new Error('Cet email est déjà utilisé.'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);

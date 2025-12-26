const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Inscription d'un nouvel utilisateur
exports.signup = (req, res) => {
  // Hacher le mot de passe avant de le sauvegarder dans la base de données
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Créer un nouvel utilisateur avec l'email et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      return user.save();
    })
    .then(() => {
      res.status(201).json({ message: 'Utilisateur créé !' });
    })
    // Gérer les erreurs, notamment l'email déjà utilisé
    .catch((error) => {
      const message = error.message === 'Cet email est déjà utilisé.'
        ? error.message
        : 'Erreur lors de l\'inscription';
      res.status(400).json({ error: message });
    });
};

// Connexion d'un utilisateur existant
exports.login = (req, res) => {
  // Rechercher l'utilisateur dans la base de données
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: 'Utilisateur non trouvé !' });
        return null; // évite ESLint "expected return"
      }
      // Comparer le mot de passe fourni avec le mot de passe haché dans la base de données
      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          res.status(401).json({ message: 'Mot de passe incorrect !' });
          return null;
        }
        // Générer un token JWT valide 24h
        res.status(200).json({
          userId: user._id,
          token: jwt.sign(
            { userId: user._id },
            process.env.RANDOM_TOKEN_SECRET,
            { expiresIn: '24h' },
          ),
        });
        return null;
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.signup = (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      return user.save();
    })
    .then(() => {
      res.status(201).json({ message: 'Utilisateur créé !' });
    })
    .catch((error) => {
      console.log('BREAKING: ', error);
      res.status(500).json({ error });
    });
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: 'Utilisateur non trouvé !' });
        return null; // évite ESLint "expected return"
      }

      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          res.status(401).json({ message: 'Mot de passe incorrect !' });
          return null;
        }
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

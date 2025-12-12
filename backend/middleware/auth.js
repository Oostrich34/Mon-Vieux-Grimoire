const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authorization.split(' ')[1]; // "Bearer <token>"
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);

    const { userId } = decodedToken;

    // 💡 Définition de la variable dans la requête (req.userId)
    // Cela correspond à la lecture dans votre contrôleur: userId: req.userId,
    req.auth = { userId };

    return next();
  } catch (error) {
    // Utiliser le message de l'erreur JWT s'il existe, sinon un message générique
    return res.status(401).json({ error: error.message || 'Requête non authentifiée' });
  }
};

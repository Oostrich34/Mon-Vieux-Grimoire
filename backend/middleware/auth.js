const jwt = require('jsonwebtoken');

// Middleware d'authentification
module.exports = (req, res, next) => {
  try {
    // Récupérer le token d'authentification depuis les en-têtes de la requête
    const { authorization } = req.headers;
    // Vérifier que le token est présent
    if (!authorization) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    // Extraire le token (enlever le préfixe "Bearer ")
    const token = authorization.split(' ')[1]; // "Bearer <token>"

    // Vérifier et décoder le token
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);

    // Extraire l'userId du token décodé
    const { userId } = decodedToken;

    // Ajouter l'userId à la requête pour les prochains middlewares/contrôleurs
    req.auth = { userId };

    return next();
  } catch (error) {
    // Utiliser le message de l'erreur JWT s'il existe, sinon un message générique
    return res.status(401).json({ error: error.message || 'Requête non authentifiée' });
  }
};

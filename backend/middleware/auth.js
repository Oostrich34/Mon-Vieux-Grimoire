const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authorization.split(' ')[1]; // "Bearer <token>"
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const { userId } = decodedToken;

    if (req.body.userId && req.body.userId !== userId) {
      return res.status(401).json({ error: 'User ID non valable' });
    }

    req.userId = userId;
    return next(); // <-- return ajouté pour satisfaire ESLint
  } catch (error) {
    return res.status(401).json({ error: error.message || 'Requête non authentifiée' });
  }
};

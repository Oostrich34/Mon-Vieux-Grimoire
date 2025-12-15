const http = require('http');
const app = require('./app');
require('dotenv').config();

// Normalisation du port d'écoute
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  // Vérifier si le port est un nombre valide
  if (Number.isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
// Définir le port d'écoute
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

// Création du serveur HTTP
const server = http.createServer(app);

// Gestion des erreurs du serveur
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address(); // Récupérer l'adresse du serveur
  const bind = typeof address === 'string' ? `'pipe ' + ${address}` : `'port: ' + ${port}`; // Déterminer le type d'adresse

  switch (error.code) { // Gérer les différents codes d'erreur
    case 'EACCES':
      console.error(`${bind} + ' requires elevated privileges.'`); // eslint-disable-line no-console
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} + ' is already in use.'`); // eslint-disable-line no-console
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Écoute des événements du serveur
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address(); // Récupérer l'adresse du serveur
  const bind = typeof address === 'string' ? `'pipe ' + ${address}` : `'port: ' + ${port}`; // Déterminer le type d'adresse
  console.log(`'Listening on ' + ${bind}`); // eslint-disable-line no-console
});

server.listen(port);

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises'); // Utilisation de fs/promises pour async/await

// --- Multer Configuration ---
// 1. Stocker le fichier en mémoire pour que Sharp y accède
const storage = multer.memoryStorage();

// Définition de l'uploader
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB pour l'image
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Le fichier doit être une image.'), false);
    }
    return callback(null, true);
  },
}).single('image');

// --- Dossier de destination ---
const imagesDir = path.join(__dirname, '..', 'images');

// Assurez-vous que le répertoire 'images' existe (facultatif mais recommandé)
// Une vérification en amont dans le middleware global est souvent préférable.
(async () => {
  try {
    await fs.mkdir(imagesDir, { recursive: true });
  } catch (error) {
    console.error("Erreur lors de la création du dossier 'images':", error);
  }
})();

// --- Middleware de Traitement et Enregistrement (Sharp) ---
const processImage = async (req, res, next) => {
  // S'assurer qu'un fichier a été uploadé
  if (!req.file) {
    return next(); // Passe au middleware suivant si aucun fichier n'est présent
  }

  const { file } = req;

  try {
    // 1. Définir un nom de fichier unique et sûr
    // (Utilisation d'un nom basé sur le temps + un nom nettoyé ou un id unique)
    const originalNameClean = path.parse(file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const filename = `${originalNameClean}-${timestamp}.webp`;
    const filepath = path.join(imagesDir, filename);

    // 2. Traitement avec Sharp (Asynchrone)
    await sharp(file.buffer)
      .resize(500) // Redimensionnement facultatif
      .webp({ quality: 20 })
      .toFile(filepath); // Enregistrement du fichier traité

    // 3. Ajouter les informations du fichier traité à la requête
    // Pour que le contrôleur puisse l'utiliser
    req.file.filename = filename; // Nom du fichier sur le disque
    req.file.filepath = filepath; // Chemin complet
    // req.file.imageUrl est souvent construit dans le contrôleur ou dans un service
    req.file.imageUrl = `${req.protocol}://${req.get('host')}/images/${filename}`;

    return next(); // Passer au contrôleur
  } catch (error) {
    console.error('Erreur de traitement Sharp :', error);
    // Supprimer le fichier temporaire en mémoire si nécessaire (Multer le fait généralement)
    // Renvoyer une erreur au client
    return res.status(500).json({ message: "Erreur lors du traitement de l'image." });
  }
};

module.exports = { upload, processImage };

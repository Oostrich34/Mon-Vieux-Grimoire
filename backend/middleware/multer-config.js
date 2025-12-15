const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');

// --- Configuration de Multer (Upload) ---
const storage = multer.memoryStorage();

// Définition de l'uploader
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB pour l'image
  },
  fileFilter: (req, file, callback) => {
    // Accepter uniquement les fichiers images
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Le fichier doit être une image.'), false);
    }
    return callback(null, true);
  },
}).single('image');

// --- Dossier de destination ---
const imagesDir = path.join(__dirname, '..', 'images');

// S'assurer que le dossier 'images' existe
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
  // Récupérer le fichier uploadé
  const { file } = req;

  try {
    // 1. Générer un nom de fichier unique
    const originalNameClean = path.parse(file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Nettoyer le nom d'origine
    const timestamp = Date.now(); // Pour garantir l'unicité
    const filename = `${originalNameClean}-${timestamp}.webp`; // On convertit tout en .webp
    const filepath = path.join(imagesDir, filename); // Chemin complet

    // 2. Traitement avec Sharp (Asynchrone)
    await sharp(file.buffer)
      .resize(500) // Redimensionner à une largeur de 500px
      .webp({ quality: 20 }) // Compression en WebP
      .toFile(filepath); // Enregistrement du fichier traité

    // 3. Ajouter les infos du fichier traité à la requête
    req.file.filename = filename; // Nom du fichier sur le disque
    req.file.filepath = filepath; // Chemin complet
    req.file.imageUrl = `${req.protocol}://${req.get('host')}/images/${filename}`; // URL accessible publiquement

    return next(); // Passer au contrôleur
  } catch (error) {
    // Gérer les erreurs de traitement
    return res.status(500).json({ message: "Erreur lors du traitement de l'image." });
  }
};

module.exports = { upload, processImage };

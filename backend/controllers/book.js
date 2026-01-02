const fs = require('fs');
const Book = require('../models/Book');

// Création d'un nouveau livre
exports.createBook = (req, res) => {
  // Si nous arrivons ici, req.auth.userId est défini.
  // Récupérer les données du livre
  const bookObject = JSON.parse(req.body.book);

  // Validation des champs
  if (!bookObject.title || !bookObject.author || !bookObject.year || !bookObject.genre) {
    // Supprimer le fichier image téléchargé en cas d'erreur de validation
    if (req.file) {
      fs.unlink(`images/${req.file.filename}`, (err) => {
        if (err) console.log('Erreur lors de la suppression du fichier :', err);
      });
    }

    return res.status(400).json({
      message: 'Tous les champs doivent être remplis !',
    });
  }

  delete bookObject._id;
  /* eslint-disable-next-line no-underscore-dangle */
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    ratings: bookObject.ratings || [],
    averageRating: bookObject.averageRating || 0,
  });

  // On ajoute "return" devant book.save() et devant les réponses res.status()
  return book.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Modification d'un livre existant
exports.modifyBook = (req, res) => {
  // Construire l'objet bookObject en fonction de la présence d'un fichier image
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book), // Analyser les données du livre
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // Nouvelle URL de l'image
  } : { ...req.body }; // Sinon, prendre les données du corps de la requête

  /* eslint-disable-next-line no-underscore-dangle */
  delete bookObject._userId; // Supprimer userId pour éviter les modifications non autorisées

  // Vérifier que l'utilisateur est autorisé à modifier ce livre
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification de l'utilisateur
      if (book.userId !== req.auth.userId) { // Comparer avec l'userId du token
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        // Mettre à jour le livre
        // Assurer que l'ID reste le même
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié !' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Suppression d'un livre
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification de l'utilisateur
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        // Supprimer l'image associée au livre
        const filename = book.imageUrl.split('/images/')[1];
        // Supprimer le fichier image du système de fichiers
        fs.unlink(`images/${filename}`, () => {
          // Supprimer le livre de la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Récupération d'un seul livre
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => {
      res.status(404).json({ error });
    });
};

// Récupération de tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

/* eslint-disable no-param-reassign */
exports.rateBook = (req, res) => {
  const { rating } = req.body;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const alreadyRated = book.ratings.find((r) => r.userId === req.auth.userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Livre déjà noté' });
      }

      // Création du nouvel objet de notation
      const newRating = { userId: req.auth.userId, grade: rating };

      // On met à jour les données du livre sans réassigner la variable "book"
      const updatedRatings = [...book.ratings, newRating];

      // Calcul de la moyenne
      const sumOfRatings = updatedRatings.reduce((acc, r) => acc + r.grade, 0);
      const newAverageRating = parseFloat((sumOfRatings / updatedRatings.length).toFixed(1));

      // Utilisation de la méthode update de Mongoose ou réassignation via propriétés
      book.ratings.push(newRating);
      book.averageRating = newAverageRating;

      return book.save();
    })
    .then((updatedBook) => res.status(200).json(updatedBook))
    .catch((error) => res.status(500).json({ error }));
};

// Récupération des 3 livres les mieux notés
exports.getBestRating = (req, res) => {
  // On trie par note moyenne descendante (-1), puis on limite à 3
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

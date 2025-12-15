const fs = require('fs');
const Book = require('../models/Book');

// Création d'un nouveau livre
exports.createBook = (req, res) => {
  // Si nous arrivons ici, req.auth.userId est défini.
  const bookObject = JSON.parse(req.body.book);
  // Supprimer les champs non autorisés
  delete bookObject._id;
  /* eslint-disable-next-line no-underscore-dangle */
  delete bookObject._userId;
  // Créer le nouvel objet Book avec les données reçues
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    averageRating: 0,
  });
  // Enregistrer le livre dans la base de données
  book.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }); })
    .catch((error) => { res.status(400).json({ error }); });
};

// Modification d'un livre existant
exports.modifyBook = (req, res) => {
  // Construire l'objet bookObject en fonction de la présence d'un fichier image
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };

  /* eslint-disable-next-line no-underscore-dangle */
  delete bookObject._userId;

  // Vérifier que l'utilisateur est autorisé à modifier ce livre
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification de l'utilisateur
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        // Mettre à jour le livre
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

// Noter un livre
exports.rateBook = (req, res) => {
  const { rating } = req.body;
  // Vérifier que la note est valide
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur a déjà noté ce livre
      const alreadyRated = book.ratings.find((r) => r.userId === req.auth.userId);

      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }
      // Ajouter la nouvelle note
      book.ratings.push({ userId: req.auth.userId, grade: rating });
      return book.save()
        .then(() => res.status(200).json({
          message: 'Livre noté avec succès.',
        }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
};

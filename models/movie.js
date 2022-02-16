const mongoose = require('mongoose');
const validator = require('validator');

// кастомная валидация URL
const validateURL = function (val) {
  return validator.isURL(val, { require_protocol: true });
};

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: validateURL,
  },
  trailerLink: {
    type: String,
    required: true,
    validate: validateURL,
  },
  thumbnail: {
    type: String,
    required: true,
    validate: validateURL,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});

// создаем модель и экспортируем его
module.exports = mongoose.model('movie', movieSchema);
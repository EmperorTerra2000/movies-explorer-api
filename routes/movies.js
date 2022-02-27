const router = require('express').Router();// создаем роутер
const { Joi, celebrate } = require('celebrate');
const validator = require('validator');

// кастомная валидация url
const validatorUrl = (val) => {
  // require_protocol: true - не пропускает ссылки типа httpspictures.s3.yandex.net
  const result = validator.isURL(val, { require_protocol: true });
  if (result) {
    return val;
  }
  throw new Error('URL validation error');
};

const {
  createMovie,
  getMoviesMe,
  deleteMovieMe,
} = require('../controllers/movies');

router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(validatorUrl),
      trailerLink: Joi.string().required().custom(validatorUrl),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      thumbnail: Joi.string().required().custom(validatorUrl),
      movieId: Joi.string().hex().length(24).required(),
    }),
  }),
  createMovie,
);

router.get(
  '/movies',
  getMoviesMe,
);

router.delete(
  '/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteMovieMe,
);

module.exports = router;

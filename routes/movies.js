const router = require('express').Router();// создаем роутер
const { Joi, celebrate } = require('celebrate');

const {
  createMovie,
  getMoviesMe,
  deleteMovieMe,
} = require('../controllers/movies');

router.post(
  '/',
  createMovie,
);

router.get(
  '/',
  getMoviesMe,
);

router.delete(
  '/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteMovieMe,
);

module.exports = router;
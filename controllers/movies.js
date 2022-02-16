const Movie = require('../models/movie');// импорт модели User

// кастомные классы ошибок
const InvalidDataError = require('../errors/invalid-data-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');

// создание фильмов
module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const creatorId = req.user._id; // id создателя карточки

  if (
    !country
    || !director
    || !duration
    || !year
    || !description
    || !image
    || !trailerLink
    || !nameRU
    || !nameEN
    || !thumbnail
    || !movieId
  ) {
    return next(new InvalidDataError('Невалидные данные'));
  }

  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: creatorId,
  })
    .then((movie) => res.status(201).send({ data: movie }))
    .catch((err) => {
      // данная ошибка приходит со схемы монгуста
      if (err.name === 'ValidationError') {
        next(new InvalidDataError('Невалидные данные'));
      }

      next(err);
    });
};

// получение сохраненных текущим пользователем фильмов
module.exports.getMoviesMe = (req, res, next) => {
  const creatorId = req.user._id; // id создателя карточки

  return Movie.find({ owner: creatorId })
    .then((movies) => res.status(200).send({ data: movies }))
    .catch(next);
};

// удаление сохраненного фильма
module.exports.deleteMovieMe = (req, res, next) => {
  const creatorId = req.user._id; // id создателя карточки
  const { movieId } = req.params; // _id из объекта параметров запроса

  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        next(new NotFoundError('Карточка с таким id отсутствует'));
      }

      // если автор карточки - другой человек, то ошибка
      if (String(movie.owner) !== creatorId) {
        next(new ForbiddenError('У вас нет доступа к этой карточке'));
      }

      return Movie.findByIdAndRemove(movieId);
    })
    .then((movie) => res.status(200).send({ data: movie }))
    .catch(next);
};
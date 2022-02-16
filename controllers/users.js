const bcrypt = require('bcryptjs');// хеширование данных
const jwt = require('jsonwebtoken');// модуль создает токен

const User = require('../models/user');// импорт модели User

// кастомные классы ошибок
const InvalidDataError = require('../errors/invalid-data-error');
const ConflictError = require('../errors/conflict-error');

// подключаем environment переменные
const { NODE_ENV, JWT_SECRET } = process.env;

// авторизация
// добавление нового пользователя в базу данных
module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (!name || !email || !password) {
    return next(new InvalidDataError('Заполните поля корректно'));
  }

  // проверяем на существование пользователя с таким же email
  return User.findOne({
    email,
  })
    .then((user) => {
      if (user) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }

      // хешируем пароль и возвращаем промис на след then
      return bcrypt.hash(password, 10);
    })
    // создадим пользователя
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      data: {
        email: user.email,
        name: user.name,
      },
    }))
    .catch((err) => {
      // данная ошибка приходит со схемы монгуста
      if (err.name === 'ValidationError') {
        next(new InvalidDataError('При регистрации пользователя произошла ошибка'));
      }

      next(err);
    });
};

// контроллер аутентификации пользователя
module.exports.login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return next(new InvalidDataError('Заполните поля корректно'));
  }

  // поиск в бд документа по емайлу, а потом сверяем пароль (хеш)
  // данный метод берется с свойства statics схемы User
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создаем токен
      // первый аргумент это пейлоуд, т.е. что будет использоваться для создания хеша
      const token = jwt.sign(
        // пейлоуд
        { _id: user._id },
        // секретный ключ
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        // объект опций
        {
          // срок действия токена
          expiresIn: '7d',
        },
      );

      res.cookie('token', token, {
        maxAge: 3600 * 168, // время жизни файла cookie в секундах ( 7 дней )
      });

      res.end();
    })
    .catch(next);
};

// удаление JWT из куки
module.exports.deleteCookie = (req, res) => {
  res.cookie('token', '', {
    maxAge: -1,
  });

  res.end();
};

// возвращение информации о пользователе
module.exports.getUserMe = (req, res, next) => User.find({
  _id: req.user._id,
})
  .then((user) => res.status(200).send({ data: user }))
  .catch(next);

// обновление данных о пользователе (email, name)
module.exports.updateUserProfile = (req, res, next) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return next(new InvalidDataError('Заполните поля корректно'));
  }

  return User.findOne({ email })
    .then((user) => {
      // если в бд найдется пользователь с таким email, отклоняем промис
      // если email остается прежним, то не выдаем ошибку
      if (user && String(user._id) !== req.user._id) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }

      // обновление профиля пользователя
      return User.findByIdAndUpdate(
        req.user._id,
        {
          email,
          name,
        },
        // передаем объект опций
        {
          // данные в обработчик then будут поступать уже в обновленном состоянии
          new: true,
          // перед изменением данные будут валидироваться
          runValidators: true,
        },
      )
        .then((userNew) => res.send({ data: userNew }));
    })
    .catch(next);
};
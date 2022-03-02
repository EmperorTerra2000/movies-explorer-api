const bcrypt = require('bcryptjs');// хеширование данных

const User = require('../models/user');// импорт модели User

// кастомные классы ошибок
const InvalidDataError = require('../errors/invalid-data-error');
const ConflictError = require('../errors/conflict-error');

// авторизация
// добавление нового пользователя в базу данных
module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10).then((hash) => User.create({
    name, email, password: hash,
  })
    .then((user) => {
      const newUser = user.toObject();
      delete newUser.password;
      res.status(201).send(newUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidDataError('При регистрации пользователя произошла ошибка');
      }
      if (err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует');
      }
      return next(err);
    }))
    .catch(next);
};

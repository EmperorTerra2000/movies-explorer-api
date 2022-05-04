// const bcrypt = require('bcryptjs');// хеширование данных
const jwt = require("jsonwebtoken"); // модуль создает токен

const User = require("../models/user"); // импорт модели User

// кастомные классы ошибок
const InvalidDataError = require("../errors/invalid-data-error");

// подключаем environment переменные
const { NODE_ENV, JWT_SECRET } = process.env;

// контроллер аутентификации пользователя
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new InvalidDataError("Заполните поля корректно"));
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
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        // объект опций
        {
          // срок действия токена
          expiresIn: "7d",
        }
      );

      // вернем токен
      res.send({ token });
    })
    .catch(next);
};

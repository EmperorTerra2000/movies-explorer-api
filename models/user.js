const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UnauthorizedError = require('../errors/unauthorized-error');

// кастомная валидация email пользователя
const validateEmail = function (val) {
  return validator.isEmail(val);
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: validateEmail,
    unique: true, // емайл является уникальным, повторов не должно быть
  },
  password: {
    type: String,
    required: true,
    // свойство предотвращает передачу пароля (хэш)
    // с остальными данными при запросе
    select: false,
  },
  name: {
    type: String,
    required: true,
    default: 'Пользователь',
    minlength: 2,
    maxlength: 30,
  },
});

// добавим метод схеме пользователя
// у него будет два параметра - почта и пароль
// добавляем в свойство statics объекта userSchema
userSchema.statics.findUserByCredentials = function (email, password) {
  // попытаемся найти пользователя по почте
  return this.findOne({ email }).select('+password')
    .then((user) => {
      // не найден -> отклоняем промис
      if (!user) {
        return Promise.reject(new UnauthorizedError('Вы ввели неправильный логин или пароль'));
      }

      // найдено -> сравниваем хеши
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Вы ввели неправильный логин или пароль'));
          }

          return user;// возвращаем данные с пользователем
        });
    });
};

// создаем модель и экспортируем его
module.exports = mongoose.model('user', userSchema);

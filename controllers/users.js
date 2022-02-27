const User = require('../models/user');// импорт модели User

// кастомные классы ошибок
const InvalidDataError = require('../errors/invalid-data-error');
const ConflictError = require('../errors/conflict-error');

// возвращение информации о пользователе
module.exports.getUserMe = (req, res, next) => User.find({
  _id: req.user._id,
})
  .then((user) => res.send({ data: user }))
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

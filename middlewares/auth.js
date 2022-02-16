const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

// подключаем env переменные
const { NODE_ENV, JWT_SECRET } = process.env;

// Авторизация в приложении работает как мидлвэр
// Если предоставлен верный токен, запрос проходит на дальнейшую обработку
// Иначе запрос переходит контроллеру, который возвращает клиенту сообщение об ошибке
module.exports = (req, res, next) => {
  // достаем токен из cookies
  const { token } = req.cookies;

  if (!token) {
    next(new UnauthorizedError('Вы не авторизовались, авторизуйтесь'));
  }

  let payload;

  try {
    // верифицируем токен
    // метод verify вернет пейлоуд токена, если тот прошел проверку, а если нет
    // то вернет ошибку
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new UnauthorizedError('У вас какой-то плохой токен, авторизуйтесь !'));
  }

  req.user = payload;// записываем пейлоуд в объект запроса

  return next();// пропускаем запрос дальше
};
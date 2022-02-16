// загружает файл .env в Node.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// модуль отвечающий за process.env.NODE_ENV

const { errors, Joi, celebrate } = require('celebrate');

// импортируем логгеры
const { requestLogger, errorLogger } = require('./middlewares/logger');

// импортируем роутеры
const routerUser = require('./routes/users');
const routerMovie = require('./routes/movies');

// контроллеры аутентификации, авторизации
const { createUser, login, deleteCookie } = require('./controllers/users');

// импорт миддлвэр
const auth = require('./middlewares/auth');
// миддлэр CORS
const cors = require('./middlewares/cors');

// импорт кастомных ошибок
const NotFoundError = require('./errors/not-found-error');

// подключаем environment переменные
const { NODE_ENV, JWT_SECRET } = process.env;

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());// для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true }));// для приема страниц внутри POST-запроса
// промежуточный обработка сookie-parser
// исполь-ся для шифрования значений файлов перед их отправкой клиенту
app.use(cookieParser(NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

// Логгер запросов нужно подключить до всех обработчиков роутов
app.use(requestLogger);// подключаем логгер запросов

app.use(cors);// обработка кросс-доменных запросов

app.use('/users', auth, routerUser);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  createUser,
);
// удаление cookie файла
app.post(
  '/signout',
  deleteCookie,
);

app.use('/movie', auth, routerMovie);

// errorLogger нужно подключить после обработчиков роутов и до обработчиков ошибок
app.use(errorLogger);// подключаем логгер ошибок

// обработка запроса на несуществующий роут
app.use((req, res, next) => {
  next(new NotFoundError('404 Страница по указанному маршруту не найдена.'));
});

// обработчки ошибок celebrate
app.use(errors());

// централизованная обработка ошибок
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? '500 На сервере произошла ошибка.' : message });

  next();
});

app.listen(
  PORT,
  () => {
    console.log(`App listening ob port ${PORT}`);
  },
);
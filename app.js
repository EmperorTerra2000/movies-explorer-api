// загружает файл .env в Node.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
// модуль отвечающий за process.env.NODE_ENV

const { errors } = require("celebrate");

// импортируем логгеры
const { requestLogger, errorLogger } = require("./middlewares/logger");

// импортируем роутеры
const {
  routerUser,
  routerMovie,
  routerSignUp,
  routerSignIn,
  routerSignOut,
} = require("./routes/index");

// импорт миддлвэр
const auth = require("./middlewares/auth");
const { limiter } = require("./middlewares/rate-limit");
// миддлэр CORS
const cors = require("./middlewares/cors");

// импорт кастомных ошибок
const NotFoundError = require("./errors/not-found-error");

// подключаем environment переменные
const { NODE_ENV, JWT_SECRET, DB_ROUTE } = process.env;

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet()); // автоматическое проставление заголовков безопасности (Content-Security-Policy..)
app.use(limiter);
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приема страниц внутри POST-запроса
// промежуточный обработка сookie-parser
// исполь-ся для шифрования значений файлов перед их отправкой клиенту
app.use(cookieParser(NODE_ENV === "production" ? JWT_SECRET : "dev-secret"));

// подключаемся к серверу mongo
mongoose.connect(
  NODE_ENV === "production" ? DB_ROUTE : "mongodb://localhost:27017/moviesdb",
  {
    useNewUrlParser: true,
  }
);

// Логгер запросов нужно подключить до всех обработчиков роутов
app.use(requestLogger); // подключаем логгер запросов

app.use(cors); // обработка кросс-доменных запросов

app.use(routerSignIn);
app.use(routerSignUp);

// мидлвэр авторизации используем для всего приложения
app.use(auth);

// удаление cookie файла
app.use(routerSignOut);

app.use(routerMovie);

app.use(routerUser);

// обработка запроса на несуществующий роут
app.use((req, res, next) => {
  next(new NotFoundError("404 Страница по указанному маршруту не найдена."));
});

// errorLogger нужно подключить после обработчиков роутов и до обработчиков ошибок
app.use(errorLogger); // подключаем логгер ошибок

// обработчки ошибок celebrate
app.use(errors());

// централизованная обработка ошибок
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message:
        statusCode === 500 ? "500 На сервере произошла ошибка." : message,
    });

  next();
});

app.listen(PORT, () => {
  console.log(`App listening ob port ${PORT}`);
});

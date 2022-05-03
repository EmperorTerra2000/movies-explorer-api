// массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  "https://movies.praktikum.nomoredomains.work",
  "http://movies.praktikum.nomoredomains.work",
  "http://localhost:3000",
];

module.exports = (req, res, next) => {
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin
  const { method } = req; // сохраняем тип запроса (http-метод)
  // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
  const DEFAULT_ALLOWED_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";
  // Сохраняем список заголовков исходного запроса
  const requestHeaders = req.headers["access-control-request-headers"];

  // проверяем, что источник запроса есть среди разрешенных
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header("Access-Control-Allow-Origin", origin);
    // Если это предварительный запрос, добавляем нужные заголовки
    if (method === "OPTIONS") {
      // Разрешаем кросс-доменные запросы любых типов (по умолчанию)
      res.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
      res.header("Access-Control-Allow-Headers", requestHeaders);
      res.header("Access-Control-Allow-Credentials", "true");

      // завершаем обработку запроса и возвращаем результат клиенту
      return res.end();
    }
  }

  return next();
};

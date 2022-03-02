const router = require('express').Router();// создали роутер

const {
  deleteCookie,
} = require('../controllers/signout');// импортируем контроллеры

router.get(
  '/signout',
  deleteCookie,
);

module.exports = router;

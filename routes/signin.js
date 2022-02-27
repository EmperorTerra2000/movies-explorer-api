const { Joi, celebrate } = require('celebrate');

const router = require('express').Router();// создали роутер

const {
  login,
} = require('../controllers/signin');// импортируем контроллеры

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  login,
);

module.exports = router;

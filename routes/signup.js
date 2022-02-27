const { Joi, celebrate } = require('celebrate');

const router = require('express').Router();// создали роутер

const {
  createUser,
} = require('../controllers/signup');// импортируем контроллеры для пользователей

router.post(
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

module.exports = router;

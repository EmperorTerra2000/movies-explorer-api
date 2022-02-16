const { Joi, celebrate } = require('celebrate');

// создаем роутер
const router = require('express').Router();// создали роутер
const {
  getUserMe,
  updateUserProfile,
} = require('../controllers/users');// импортируем контроллеры для пользователей

router.get('/me', getUserMe);
router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
    }),
  }),
  updateUserProfile,
);

module.exports = router;
const { body }  = require("express-validator")

const loginValidation = [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
]

const registerValidation = [
    body('email', 'Не правильный формат e-mail').isEmail(),
    body('password', 'Пароль должен состоять минимум из 8 символов').isLength({ min: 8 }),
]

const createGameValidation = [
    body('bet', 'Ставка не может быть такой').custom(value => {
        if (value > 100) {
            return 'Ставка не может быть такой'
        }
        return value
    })
]

module.exports.loginValidation = loginValidation
module.exports.registerValidation = registerValidation


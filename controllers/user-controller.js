const UserModel = require("../models/user-model.js")
const userService = require("../service/user-service.js")
const { validationResult } = require('express-validator')

class UserController {
    async registration(req, res) {
        try {
            const { password, email } = req.body
            const user = await UserModel.findOne({ email })

            if (user) {
                return res.status(400).json({
                    message: 'Нельзя использовать этот e-mail'
                })
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array())
                return res.status(400).json({
                    message: 'Не верно указан e-mail или пароль'
                })
            }

            const userData = await userService.registration(password, email)
            // res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, httpOnly: true, sameSite: 'none'})
            return res.json(userData)
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось зарегестрироваться'
            })

        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect('https://dunge.space');
        } catch (e) {
            console.log(e);
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log(email, password);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array())
                return res.status(400).json({
                    message: 'Не верно указан e-mail или пароль'
                })
            }

            const userData = await userService.login(email, password);
            // res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, httpOnly: true, sameSite: 'none'})

            return res.json(userData);
        } catch (e) {
            console.log(e);
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const refreshToken = req.headers.authorization;

            const token = refreshToken.split(' ')[1];
            if (!token) {
                return next(ApiError.UnauthorizedError());
            }
            userService.logout(token);
           
            return res.json({message: 'success'});
        } catch (e) {
            console.log(e);
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const refreshToken = req.headers.authorization;
            
            const token = refreshToken.split(' ')[1];
            if (!token) {
                return next(ApiError.UnauthorizedError());
            }
            const userData = await userService.refresh(token);
            // res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, httpOnly: true, sameSite: 'none'})
            return res.json(userData);
        } catch (e) {
            console.log(e);
            next(e)
        }
    }
}

module.exports = new UserController()

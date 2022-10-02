const UserModel = require("../models/user-model.js")
const bcrypt = require('bcrypt')
const uuid = require('uuid');
const tokenService = require('./token-service.js')
const UserDto = require("../dtos/user-dto.js")
const mailer = require('./mail-service')
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration(password, email) {
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const user = await UserModel.create({ email, password: hashPassword, activationLink: activationLink })


        const message = {
            from: 'Mailer Test <7n7a7m7e@gmail.com>',
            to: email,
            subject: 'Активация аккаунта на',
            text: 'Чтобы активировать аккаунт, перейдите по ссылке ниже',
            html:
                `
                <div>
                    <h1>Для активации перейдите по ссылке</h1>
                    <a href="https://dunge.space/api/activate/${activationLink}">https://dunge.space/api/activate/${activationLink}</a>
                </div>
            `
        }
        mailer(message)

        const userDto = new UserDto(user); // id, email, isActivate
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, userData: userDto }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink })
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email })
        if (!user) {
            throw ApiError.BadRequest('Не верно указан e-mail или пароль')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Не верно указан e-mail или пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, userData: userDto }
    }

    async logout(token) {
        await tokenService.removeToken(token);
    }

    async refresh(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        console.log('result refresh validate', userData);
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, userData: userDto }
    }
}

module.exports = new UserService()
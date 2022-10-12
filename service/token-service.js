const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token-model.js')
const ApiError = require('../exceptions/api-error');
require('dotenv').config()

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, 'process.env.SECRET', { expiresIn: '1min' })
        const refreshToken = jwt.sign(payload, 'process.env.SECRET', { expiresIn: '30d' })
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(authorizationHeader) {
        try {
            const accessToken = authorizationHeader.split(' ')[1];
            if (!accessToken) {
                return next(ApiError.UnauthorizedError());
            }
            const userData = jwt.verify(accessToken, 'process.env.SECRET');

            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, 'process.env.SECRET');
            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await TokenModel.findOne({ user: userId })
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await TokenModel.create({ user: userId, refreshToken })
        return token;
    }

    async removeToken(refreshToken) {
        await TokenModel.deleteOne({ refreshToken })

    }

    async findToken(refreshToken) {
        const tokenData = await TokenModel.findOne({ refreshToken })
        return tokenData;
    }
}

module.exports = new TokenService()

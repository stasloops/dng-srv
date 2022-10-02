const GameModel = require("../models/game-model.js")
const short = require('shortid');
const gameService = require("../service/game-service.js");
const tokenService = require('../service/token-service');

class DiceController {
    async createGame(req, res) {
        try {
            const { bet, range, isMore, category } = req.body
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            const gameId = short()
            const a = 1000000 / 100 * range
            const b = a - 1
            const c = 1000000 - a
            const droppedNumber = Math.floor(Math.random() * 1000000)

            const response = await gameService.bet(bet, userData.id)
            if (response.status === 'fail') {
                console.log(response.text);
                return res.status(400).json({
                    message: response.text
                })
            }

            if (isMore ? droppedNumber > c : droppedNumber < b) {
                const message = `win 'random -', ${droppedNumber} 'от 0 до', ${b}`
                const createCoeff = 100 / range - 0.01
                const coeff = createCoeff.toFixed(2)
                const reward = Number(coeff) * bet
                const updatedUser = await gameService.reward(reward, userData.id)
                const newBalance = updatedUser.balance
                await GameModel.create({ userId: userData.id, gameId, bet, coeff: Number(coeff), reward: reward, gameCategory: category ? category : 'dice', dropped: droppedNumber, gameStatus: 'start' })
                res.json({ newBalance, droppedNumber, message })

            } else {
                const message = `fail 'random -', ${droppedNumber} 'от 0 до', ${a}`
                await GameModel.create({ userId: userData.id, gameId, bet, coeff: 0, reward: 0, gameCategory: category ? category : 'dice', dropped: droppedNumber, gameStatus: 'start' })
                res.json({ newBalance: response.updatedUser.balance, droppedNumber, message })
            }

        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }
}

module.exports = new DiceController()
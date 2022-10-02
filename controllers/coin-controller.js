const GameModel = require("../models/game-model.js")
const short = require('shortid');
const gameService = require("../service/game-service.js");
const tokenService = require('../service/token-service');

class CoinController {
    async createGame(req, res) {
        try {
            const { bet } = req.body
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

            const codeEl = 'x'
            const gameID = 'create'
            const mustCodePrev = ''
            const mustCode = 'x'
            const sequence = await gameService.checkSequence(codeEl, gameID, mustCodePrev, mustCode)

            if (sequence.text !== 'ok') {
                console.log(sequence.text);
                return res.status(400).json({
                    message: sequence.text
                })
            }

            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            const response = await gameService.bet(bet, userData.id)
            if (response.status === 'fail') {
                console.log(response.text);
                return res.status(400).json({
                    message: response.text
                })
            }

            const newGameStatus = 'calculation'
            const gameId = short()
            const newBalance = response.updatedUser.balance

            await GameModel.create({ userId: userData.id, gameId, bet, coeff: 1.9, reward: 0, gameCategory: 'flipCoin', gameStatus: newGameStatus, sequence: sequence.sequence })
            res.json({ newBalance, gameId, newGameStatus })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }

    async calculationGame(req, res) {
        try {
            const { gameID, selectedCoin } = req.body
            if (selectedCoin !== 0 && selectedCoin !== 1) {
                return res.status(404).json({
                    message: 'Не выбрана сторона'
                })
            }
            const codeEl = 'y'
            const mustCodePrev = 'x'
            const mustCode = 'xy'
            const sequence = await gameService.checkSequence(codeEl, gameID, mustCodePrev, mustCode)

            if (sequence.text !== 'ok') {
                console.log(sequence.text);
                return res.status(400).json({
                    message: sequence.text
                })
            }

            const newGameStatus = 'end'
            const randomCoin = Math.floor(Math.random() * 2)
            const isWin = selectedCoin === randomCoin ? true : false
            await GameModel.findOneAndUpdate({ gameId: gameID }, { win: isWin, gameStatus: newGameStatus, dropped: randomCoin, selected: selectedCoin})
            res.json({ isWin, newGameStatus, randomCoin })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }

    async endGame(req, res) {
        try {
            const { gameID } = req.body
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            const codeEl = 'z'
            const mustCodePrev = 'xy'
            const mustCode = 'xyz'
            const sequence = await gameService.checkSequence(codeEl, gameID, mustCodePrev, mustCode)

            if (sequence.text !== 'ok') {
                console.log(sequence.text);
                return res.status(400).json({
                    message: sequence.text
                })
            }

            const game = await GameModel.findOne({ gameId: gameID })
            const newGameStatus = 'start'

            if (!game.win) {
                await GameModel.findOneAndUpdate({ gameId: gameID }, { gameStatus: newGameStatus })
                return res.json({ newGameStatus })
            }

            const reward = game.bet * game.coeff
            await GameModel.findOneAndUpdate({ gameId: gameID }, { reward: reward, gameStatus: newGameStatus })
            const updatedUser = await gameService.reward(reward, userData.id)
            const newBalance = updatedUser.balance
            res.json({ newBalance, newGameStatus })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }

    async checkGameStatus(req, res) {
        try {
            const { gameID } = req.body
            const { gameStatus, win, dropped, selected, bet} = await GameModel.findOne({ gameId: gameID })
            const selectedCoin = selected
            const isWin = win
            const randomCoin = dropped
           
            res.json({ gameStatus, isWin, randomCoin, bet, selectedCoin })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось получить статус игры'
            })
        }
    }
}

module.exports = new CoinController()
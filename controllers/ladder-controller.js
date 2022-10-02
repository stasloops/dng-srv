const tokenService = require('../service/token-service');
const short = require('shortid');
const gameService = require("../service/game-service.js");
const GameModel = require("../models/game-model.js")

class LadderController {
    async createGame(req, res) {
        try {
            const { bet } = req.body
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

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

            const level = 50
            const storey = 1
            const nums = []

            for (let i = 1; i <= 5; i++) {
                const num = level - i
                nums.push(num)
            }
            const newLevel = level - 5
            const stones = []
            await GameModel.create({ userId: userData.id, gameId, bet, coeff: 1, reward: 0, gameCategory: 'ladder', gameStatus: newGameStatus, ladder: { level: newLevel, storey: storey, stones: stones }, })
            res.json({ balance: response.updatedUser.balance, gameId, newGameStatus, nums })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }

    async calculationGame(req, res) {
        try {
            const { gameID, selectedCell } = req.body
            if (!selectedCell) {
                return res.status(404).json({
                    message: 'Не выбрана клетка'
                })
            }
            const { ladder, coeff } = await GameModel.findOne({ gameId: gameID })
            const { level, stones, storey } = ladder
            const haveCoeff = [1.20, 1.50, 1.90, 2.40, 2.90, 3.40, 4, 5.50, 7, 9]

            const nums = []
            for (let i = 1; i <= 5; i++) {
                const num = level - i
                nums.push(num)
            }

            const itemStone = Math.floor(Math.random() * 5) + 1
            nums.reverse()
            const stoneIndex = nums[itemStone - 1] + 5
            stones.push(itemStone)
            const positionStone = stones[storey - 1]
            const stone = { stoneIndex: stoneIndex, positionStone: positionStone }

            const isWin = positionStone === selectedCell ? false : true
            const newCoeff = isWin ? haveCoeff[storey - 1] : 0

            const newGameStatus = 'end'
            await GameModel.findOneAndUpdate({ gameId: gameID }, { ladder: { level: level - 5, storey: storey + 1, stones: stones }, coeff: newCoeff, gameStatus: newGameStatus })
            if (newCoeff === 0) {
                return res.json({ stone, nums: [], isFail: true })
            }
            res.json({ nums, stone, newGameStatus, newCoeff })
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
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }
            const { bet, coeff } = await GameModel.findOne({ gameId: gameID })
            const reward = bet * coeff
            const newGameStatus = 'start'
            await GameModel.findOneAndUpdate({ gameId: gameID }, { reward: reward, gameStatus: newGameStatus })
            const { balance } = await gameService.reward(reward, userData.id)
            res.json({ balance, newGameStatus })
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
            const { gameStatus, bet, ladder} = await GameModel.findOne({ gameId: gameID })
           
            res.json({ gameStatus, bet, nums: ladder.nums, stone: ladder.stone, newCoeff })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось получить статус игры'
            })
        }
    }
}

module.exports = new LadderController()
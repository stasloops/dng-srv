const UserModel = require("../models/user-model.js")
const GameModel = require("../models/game-model.js")

class GameService {
    async bet(bet, userId) {
        const user = await UserModel.findById(userId)
        if (bet <= user.balance && bet <= 100) {
            const newBalance = user.balance - bet
            const updatedUser = await UserModel.findByIdAndUpdate({ _id: userId }, { balance: newBalance }, { new: true })
            const response = { text: '!Нельзя сделать такую ставку', status: 'passed', updatedUser: updatedUser}
            return response
        } else {
            const response = { text: 'Нельзя сделать такую ставку', status: 'fail'}
            return response
        }

    }

    async reward(reward, userId) {
        const user = await UserModel.findById(userId)
        const newBalance = user.balance + reward
        const updatedUser = await UserModel.findByIdAndUpdate({ _id: userId }, { balance: newBalance }, { new: true })
        return updatedUser
    }

    async checkSequence(codeEl, gameID, mustCodePrev, mustCode) {
        if (gameID === 'create') {
            const newSequence = codeEl
            const sequence = { text: 'ok', sequence: newSequence }
            return sequence
        }
        if (gameID !== 'create') {
            const game = await GameModel.findOne({ gameId: gameID })
            if (game.sequence === mustCodePrev) {
                const newSequence = game.sequence + codeEl
                const updatedGame = await GameModel.findOneAndUpdate({ gameId: gameID }, { sequence: newSequence }, { new: true })
                if (updatedGame.sequence === mustCode) {
                    const sequence = { text: 'ok' }
                    return sequence
                }
                if (updatedGame.sequence !== mustCode) {
                    const sequence = { text: 'Не пытайся менять последовательность игры'}
                    return sequence
                }
            }
            if (game.sequence !== mustCodePrev) {
                const sequence = { text: 'Не пытайся менять последовательность игры' }
                return sequence
            }
        }
    }
}

module.exports = new GameService()


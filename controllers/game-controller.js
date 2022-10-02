const GameDto = require("../dtos/game-dto.js");
const GameModel = require("../models/game-model.js")
const tokenService = require('../service/token-service');

class GameController {
    async getFilterGame (req, res) {
        try {
            const { category } = req.params
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            if (category === 'all') {
                const games = await GameModel.find({ userId: userData.id })
                const newGames = games.map((item) => {
                    return new GameDto(item)
                })  
                res.json({ newGames })
            }
            if (category !== 'all') {
                const games = await GameModel.find({ userId: userData.id, gameCategory: category })
                const newGames = games.map((item) => {
                    return new GameDto(item)
                })  
                res.json({ newGames })
            }
        } catch (e) {
            res.json(e)
            console.log(e)
        }
    }
}

module.exports = new GameController()
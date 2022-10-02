const tokenService = require('../service/token-service');
const transferModel = require("../models/transfer-model.js");
const userModel = require("../models/user-model.js");

class TransferController {
    async addBalance(req, res) {
        try {
            const { transferId } = req.body
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            await transferModel.create({ transferId: transferId, userId: userData.id, isAdd: true })
            res.json({message: 'Запрос успешно отправлен!'})
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }

    async removeBalance(req, res) {
        try {
            const { transferId, requisites, amount } = req.body
            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)
            console.log(requisites, 'requis')
            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }
            await userModel.findByIdAndUpdate({_id: userData.id}, { requisites: requisites })
            await transferModel.create({ transferId: transferId, amount: amount, userId: userData.id, requisites: requisites, isAdd: false })
            res.json({message: 'Запрос успешно отправлен!'})
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }


}

module.exports = new TransferController()
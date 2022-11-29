const tokenService = require('../service/token-service');
const transferModel = require("../models/transfer-model.js");
const userModel = require("../models/user-model.js");
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const SECRET_KEY = process.env.SECRET_KEY
const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);


class TransferController {
    async addBalance(req, res) {
        try {
            const { amount } = req.body
            if (amount > 5000 || amount < 10) {
                return res.status(404).json({
                    message: 'Не верная сумма на оплату'
                })
            }

            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)

            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            const billId = qiwiApi.generateId();
            const lifetime = qiwiApi.getLifetimeByDay(0.01)

            const fields = {
                amount: amount,
                currency: 'RUB',
                comment: 'Hello world',
                expirationDateTime: lifetime,
                phone: '+79998869205'
            };

            const resQiwi = await qiwiApi.createBill(billId, fields)
            const qiwi = {
                payUrl: resQiwi.payUrl,
                billId: resQiwi.billId
            }
            console.log(resQiwi, 'res');

            await transferModel.create({ userId: userData.id, isAdd: true, billId: resQiwi.billId, amount: amount })
            res.json({ qiwi, message: 'Запрос успешно отправлен!' })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }

    async checkPayStatus(req, res) {
        try {
            const { billId } = req.body

            const authorizationHeader = req.headers.authorization;
            const userData = tokenService.validateAccessToken(authorizationHeader)
            if (!userData) {
                console.log('Не валидный токен');
                return res.status(401).json({
                    message: 'Не валидный токен'
                })
            }

            const transfer = await transferModel.findOne({ billId })
            if (transfer.status !== 'WAITING') {
                return res.json({ message: 'close' })
            }
            
            const resQiwi = await qiwiApi.getBillInfo(billId)
            if (resQiwi.status.value === 'PAID') {
                const transfer = await transferModel.findOneAndUpdate({ billId }, {status: resQiwi.status.value})

                const user = await userModel.findOne({ userId: userData.id })
                const newBalance = user.balance + transfer.amount

                await userModel.findOneAndUpdate({ userId: userData.id }, {balance: newBalance})

                return res.json({ balance: newBalance, message: 'бэленс обновлен!' })
            }
            res.json({ message: '!бэленс обновлен!' })
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
            await userModel.findByIdAndUpdate({ _id: userData.id }, { requisites: requisites })
            await transferModel.create({ transferId: transferId, amount: amount, userId: userData.id, requisites: requisites, isAdd: false })
            res.json({ message: 'Запрос успешно отправлен!' })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Не удалось'
            })
        }
    }


}

module.exports = new TransferController()
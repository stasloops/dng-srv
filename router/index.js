const Router = require('express').Router
const router = new Router()
const coinController = require('../controllers/coin-controller.js');
const diceController = require('../controllers/dice-controller.js');
const gameController = require('../controllers/game-controller.js');
const ladderController = require('../controllers/ladder-controller.js');
const transferController = require('../controllers/transfer-controller.js');
const userController = require('../controllers/user-controller.js');
const { registerValidation, loginValidation } = require('../validations/validation.js');

router.post('/registration', registerValidation, userController.registration)
router.post('/login', loginValidation, userController.login);
router.get('/logout', userController.logout);
router.get('/refresh', userController.refresh);
router.get('/activate/:link', userController.activate);

router.post('/coin/create', coinController.createGame)
router.post('/coin/calculation', coinController.calculationGame)
router.post('/coin/end', coinController.endGame)
router.post('/coin/status', coinController.checkGameStatus)

router.post('/ladder/create', ladderController.createGame)
router.post('/ladder/calculation', ladderController.calculationGame)
router.post('/ladder/end', ladderController.endGame)

router.post('/dice/create', diceController.createGame)

router.post('/transfer/add', transferController.addBalance)
router.post('/transfer/remove', transferController.removeBalance)

router.get('/game/:category', gameController.getFilterGame)


module.exports = router
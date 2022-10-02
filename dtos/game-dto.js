module.exports = class GameDto {
    gameId;
    win;
    bet;
    reward;
    coeff;

    constructor(model) {
        this.gameId = model.gameId;
        this.win = model.win;
        this.bet = model.bet;
        this.reward = model.reward
        this.coeff = model.coeff  
        
    }
}



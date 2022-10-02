const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gameId: { type: String, unique: true, required: true },
    win: { type: Boolean },
    bet: { type: Number, required: true },
    coeff: { type: Number, required: true },
    reward: { type: Number, required: true },
    gameCategory: { type: String, required: true },
    gameStatus: { type: String, required: true },
    dropped: { type: Number },
    selected: { type: Number },
    sequence: { type: String },
    ladder: { type: Object },
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Game', GameSchema);

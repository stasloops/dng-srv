const mongoose = require('mongoose')

const TransferSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    transferId: {type: String, required: true},
    amount: {type: Number},
    requisites: {type: String},
    isAdd: {type: Boolean, required: true}
})

module.exports =  mongoose.model('Transfer', TransferSchema);

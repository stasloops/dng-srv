const mongoose = require('mongoose')

const TransferSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    billId: { type: String },
    amount: { type: Number },
    requisites: { type: String },
    isAdd: { type: Boolean, required: true },
    status: { type: String, default: 'WAITING' }
})

module.exports = mongoose.model('Transfer', TransferSchema);

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    balance: {type: Number, default: 50},
    status: {type: String, default: 'test'},
    name: {type: String},
    password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    requisites: {type: String}
})

module.exports = mongoose.model('User', UserSchema);

const events = require('events')
const emitter = new events.EventEmitter();

class ChatController {
    async getMessage(req, res) {
        emitter.once('newMessage', (message) => {
            res.json(message)
        })
    }
    async newMessage(req, res) {
        const message = req.body;
        emitter.emit('newMessage', message)
        res.json(message)
    }
}

module.exports = new ChatController()
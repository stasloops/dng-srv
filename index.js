const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const {graphqlHTTP} = require('express-graphql')
const router = require('./router/index.js');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error-middleware');
const gameSchema = require('./shema/game.js');
require('dotenv').config()

const PORT = process.env.PORT || 7777
const DB_URL = process.env.DB_URL || 'mongodb+srv://admin:wwwwww@cluster0.gcbyrs2.mongodb.net/blog?retryWrites=true&w=majority'
const app = express()

app.use(cookieParser())
app.use(express.json());
app.use(cors((
    {
        origin: ['https://dunge.space', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
    }
)));

app.use('/api', router);
app.use(errorMiddleware)

app.get('/', (req, res) => {
    res.json('nice dunge1!!')
})

const root = {

}

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: gameSchema,
    rootValue: root
}))

const start = async () => {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => console.log('DB Started'))
        app.listen(PORT, () => {
            console.log(`Server started on PORT = ${PORT}!!!!last`)
        })
    } catch (e) {
        console.log(e, 'ERR');
    }
}

start()
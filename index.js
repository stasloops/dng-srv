const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const router = require('./router/index.js');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error-middleware');
require('dotenv').config()

const PORT = process.env.PORT || 7777
const DB_URL = process.env.DB_URL 
const app = express()

app.use(cookieParser())
app.use(express.json());
app.use(cors((
    {
        origin: ['https://dunge.space'],
        methods: ['GET', 'POST'],
        credentials: true
    }
)));


app.use('/api', router);
app.use(errorMiddleware)

const start = async () => {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => console.log('DB Started'))
        app.listen(PORT, () => {
            console.log(`Server started on PORT = ${PORT}`)
        })
    } catch (e) {
        console.log(e, 'ERR');
    }
}

start()
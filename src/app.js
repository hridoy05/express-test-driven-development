const express = require('express');
const app = express();
const userRouter = require('./user/userRouter')

app.use(express.json())
app.use(userRouter)


module.exports=app

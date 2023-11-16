const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const publicRoutes = require('./routes/public');

const app = express();
const URI = 'mongodb://127.0.0.1:27017/fourthProject?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1';


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PUSH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

app.use('/auth', authRoutes);
app.use(userRoutes);
app.use(publicRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.statusCode).json({
        message: err.message,
        data: err.data
    });
});

mongoose.connect(URI)
.then(res => {
    console.log('Connected!');
    app.listen(5000);
})
.catch(err => {
    console.log(err);
});

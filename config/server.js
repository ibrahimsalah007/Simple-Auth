const express = require('express');
const mongoose = require('mongoose');

const Key = require('./keys');

module.exports = {
    config: (app) => {
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
    },
    start: (app) => {
        app.listen(Key.PORT, () => {
            console.log(`Server Running on port ${Key.PORT}`)
            mongoose.connect(Key.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
                .then(() => console.log('Database Running...'))
                .catch(err => console.log('MongoError: ' + err))
        }
        )
    },
    routes: (app)=> {
        app.use('/api/v1/auth/', require('../routes/authentication'));
        app.use('/api/v1/protected/', require('../routes/protected'));
    }
}
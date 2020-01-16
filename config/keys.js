module.exports = {
    PORT: 80 || process.env.PORT,
    MONGO_URI: 'mongodb://localhost/Authentication',
    jsonWebTokenKey: 'temporaryKey',
}
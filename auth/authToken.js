const jwt = require('jsonwebtoken')
const { token_auth } = require('../config.json')

function authToken(req, res, next) {
    const token = req.cookies.loginsession;
    if (!token) return next();

    jwt.verify(token, token_auth, (err, user) => {
        if (err) {
            console.log(err);
            return next();
        }
        req.user = user;
        next();
    })
}

module.exports = authToken;
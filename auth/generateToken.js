const jwt = require('jsonwebtoken')
const { token_auth } = require('../config.json')

function generateToken(user) {
    return jwt.sign({ username: user }, token_auth, { expiresIn: '1h' })
}

module.exports = generateToken;
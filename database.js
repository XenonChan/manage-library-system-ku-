const db = require('mysql2');
const { database } = require('./config.json')

const dbConnect = db.createConnection(database).promise();

dbConnect.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to database.');
    }
})

module.exports = dbConnect;
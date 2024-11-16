const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const dbConnect = require('../database');
const generateToken = require('./generateToken');

const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', async (req, res) => {
    const { user_email, user_password } = req.body;
    const [rows] = await dbConnect.query('SELECT * FROM user WHERE email=?', [user_email]);
    if(rows.length == 0) {
        res.status(400).json({ error: "ไม่พบอีเมล" });
    } else {
        await bcrypt.compare(user_password, rows[0].password, function(err, result) {
            if(result) {
                const token = generateToken(rows[0].name);
                res.cookie('loginsession', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 60 * 60 * 1000,
                });
                res.status(200).json({ result: true });
            } else {
                res.status(400).json({ error: "รหัสผ่านไม่ถูกต้อง" });
            }
        })
        
    }
})

module.exports = router;
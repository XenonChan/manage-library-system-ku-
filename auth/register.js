const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const dbConnect = require('../database');
const generateToken = require('./generateToken');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', [
    body('user_email', 'โปรดใส่emailของคุณ').isEmail().custom( async (value) => {
        const [rows] = await dbConnect.query('SELECT * FROM user WHERE email = ?', [value]);
        if(rows.length > 0) {
            return Promise.reject("อีเมลนี้ถูกใช้ไปแล้ว");
        }
        return true;
    }),
    body('user_name', 'โปรดใส่ชื่อของคุณ').notEmpty().custom( async (value) => {
        const [rows] = await dbConnect.query('SELECT * FROM user WHERE name = ?', [value]);
        if(rows.length > 0) {
            return Promise.reject("ชื่อนี้ถูกใช้ไปแล้ว");
        }
        return true;
    }),
    body('user_password', 'รหัสต้องมีอักขระ6ตัวขึ้นไป').trim().isLength({ min: 6 })
], async (req, res) => {
    const validate_res = validationResult(req);
    const { user_email, user_name, user_password } = req.body;
    const hash_password = await bcrypt.hash(user_password, 12);
    if(validate_res.isEmpty()) {
        await dbConnect.query('INSERT INTO user (name, email, password) VALUES(?, ?, ?)', [user_name, user_email, hash_password]);
        const token = generateToken(user_name);
            res.cookie('loginsession', token, {
                httpOnly: true,
                secure: false,
                maxAge: 60 * 60 * 1000,
            });
        res.status(200).json({ result: true });
    } else {
        let allErrors = validate_res.errors.map((error) => {
            return error.msg
        })
    res.status(400).json({ error: allErrors });
    }
})

module.exports = router;
const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require('../database');
const authToken = require('../auth/authToken');
const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', authToken, async (req, res) => {   
    const { date_end, book_borrow_name } = req.body;
    const author = req.user.username;
    const dateBegin = new Date().toISOString().split('T')[0];
    const [user] = await dbConnect.query('SELECT * FROM borrow WHERE author = ? AND name = ?', [author, book_borrow_name]);
    const [book] = await dbConnect.query('SELECT * FROM book WHERE name = ?', [book_borrow_name]);

    if (date_end == '') {
        return res.status(400).json({ error: "โปรดใส่วันที่คืนหนังสือด้วย" })
    } else {
        if(user.length > 0) {
            return res.status(400).json({ error: "คุณยืมหนังยืมหนังสือเล่มนี้ไปแล้ว" })
         } else {
             if (book[0].amount == book[0].borrowed) {
                 return res.status(400).json({ error: "หนังสือเล่มนี้ถูกยืมหมดแล้ว" })
             } else {
                 await dbConnect.query('INSERT INTO borrow (name, author, datebegin, dateend, status, sending) VALUES (?, ?, ?, ?, ?, ?)', 
                    [book_borrow_name, author, dateBegin, date_end, "ยังไม่ได้รับหนังสือ", false])
                 await dbConnect.query('UPDATE book SET borrowed = borrowed + 1 WHERE name = ?', [book_borrow_name])
                 return res.status(200).json({ result: true })
                }
            }
        }
})

module.exports = router;

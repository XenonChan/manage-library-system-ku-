const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

const dbConnect = require('../database');

const bodyParser = require('body-parser');
const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'bookimg/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        cb(null, `${uniqueSuffix}.jpg`)
    }
})

const uploadImg = multer({ storage: storage })

router.post('/',uploadImg.single('book_img'), async (req, res) => {
    const { book_name, book_id, book_amount } = req.body;
    const book_img = req.file;
    const imageUrl = `/bookimg/${book_img.filename}`;
    const [rows] = await dbConnect.query('SELECT * FROM book WHERE bookid = ?', [book_id]);
    if (rows.length > 0) {
        return res.status(400).json({ error: "มีIDหนังสือนี้อยู่แล้วในฐานข้อมูล" });
    } else {
        await dbConnect.query('INSERT INTO book (name, bookid, img, amount, borrowed, score) VALUES(?, ?, ?, ?, ?, ?)', [book_name, book_id, imageUrl, book_amount, 0, 0])
        return res.status(200).json({ result: true });
    }
})

module.exports = router;
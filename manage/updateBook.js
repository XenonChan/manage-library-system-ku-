const express = require('express')
const multer = require('multer');
const fs = require('fs')

const dbConnect = require('../database');

const bodyParser = require('body-parser');
const path = require('path');
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

router.post('/', uploadImg.single('book_img'), async (req, res) => {
    const { book_name, book_amount, book_id } = req.body;
    const imgUrl = `/bookimg/${req.file.filename}`;
    const [old_img] = await dbConnect.query('SELECT * FROM book WHERE bookid = ?', [book_id]);
    await fs.unlink(path.join(__dirname, `../${old_img[0].img}`), (err) => {
        if (err) throw err;
    });
    await dbConnect.query('UPDATE book SET name = ?, amount = ?, img = ? WHERE bookid = ?', [book_name, book_amount, imgUrl, book_id])
    res.redirect('/admin')
})

module.exports = router;
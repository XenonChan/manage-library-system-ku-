const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require('../database');
const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))


router.post('/', async (req, res) => {
    const { book_author,book_name } = req.body;

    await dbConnect.query('DELETE FROM borrow WHERE author = ? AND name = ?', [book_author, book_name]);
    await dbConnect.query('UPDATE book SET borrowed = borrowed - 1 WHERE name = ?', [book_name]);
    
    res.redirect('/admin/list_borrowed')
})

module.exports = router;
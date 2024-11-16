const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require('../database');
const authToken = require('../auth/authToken');
const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))


router.post('/', async (req, res) => {
    const { book_author,book_name } = req.body;

    await dbConnect.query('UPDATE borrow SET status = ?, sending = ? WHERE author = ? AND name = ?', ["ผู้ใช้ได้รับหนังสือแล้ว", true, book_author, book_name]);
    res.redirect('/admin/list_borrowed')
})

module.exports = router;
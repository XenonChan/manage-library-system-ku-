const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dbConnect = require('../database');
const router = express.Router();
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/:id', async (req, res) => {
    const book_id = req.params.id;
    const [old_img] = await dbConnect.query('SELECT * FROM book WHERE bookid = ?', [book_id]);
    await fs.unlink(path.join(__dirname, `../${old_img[0].img}`), (err) => {
        if (err) throw err;
    });
    await dbConnect.query('DELETE FROM book WHERE bookid = ?', [book_id], (err) => {
        if (err) throw err;
    })
    res.redirect('/admin');
})

module.exports = router;
const cookieParser = require('cookie-parser');
const dbConnect = require('./database');
const express = require('express')
const path = require('path')
const cron = require('node-cron')
const nodemailer = require('nodemailer')

const app = express();

const deleteBook = require('./manage/arai')
const register = require('./auth/register');
const login = require('./auth/login')
const authToken = require('./auth/authToken');
const addBook = require('./manage/addBook');
const updateBook = require('./manage/updateBook');
const borrow_book = require('./manage/userBorrow');
const admin_check = require('./manage/adminCheck');
const admin_uncheck = require('./manage/adminUncheck');
const ipFilter = require('./auth/ipfilter')

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())


app.get('/', authToken, async (req, res) => {
    const [rows] = await dbConnect.query('SELECT * FROM book')
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1)
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7)

    res.render('index', 
        { user: req.user, 
        books: rows, 
        tomorrow: tomorrow.toISOString().slice(0, 10), 
        maxDate: maxDate.toISOString().slice(0, 10) 
    })
})

app.get('/admin/list_borrowed', ipFilter, async (req, res) => {
    const [rows] = await dbConnect.query('SELECT * FROM borrow')
    res.render('admin_borrowed', { books: rows });
})

app.get('/admin', ipFilter, async (req, res) => {
    const [rows] = await dbConnect.query('SELECT * FROM book')
    res.render('admin', { books: rows });
})

app.get('/borrowed', authToken, async (req, res) => {
    if (!req.user) {
        res.redirect('/');
    } else {
        const [rows] = await dbConnect.query('SELECT * FROM borrow WHERE author = ?', [req.user.username])
        res.render('user_borrowed', { user: req.user, books: rows });
    }
})

app.use('/adminuncheck', admin_uncheck);
app.use('/admincheck', admin_check);
app.use('/borrowpost', borrow_book);
app.use('/deletebook/', deleteBook);
app.use('/updatebook', updateBook);
app.use('/register', register);
app.use('/login', login)
app.use('/addbook', addBook);
app.get('/logout', (req, res) => {
    res.clearCookie('loginsession', {httpOnly: true});
    res.redirect('/')
})
app.use('/bookimg', express.static(path.join(__dirname, 'bookimg')));

async function sendEmail(detail, email) {
    const testAccount = await nodemailer.createTestAccount();

    const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
    const info = await transport.sendMail({
        from: 'Library <example@example.com>',
        to: email,
        subject: "คุณมีหนังสือต้องคืนที่ห้องสมุด",
        text: `เนื่องจากคุณมีการยืมหนังสือของทางห้องสมุดซึ่งครบกำหนดคืนวันนี้\n\nหนังสือที่คุณยืมเราไป\n\n ${detail} \n\nโปรดนำหนังสือมาคืนที่ห้องสมุด\n\nขอบคุณ`
    })
    console.log(nodemailer.getTestMessageUrl(info))
    console.log(testAccount)
}

cron.schedule('* * * * *', async () => {
    const detail = {};
    const [rows] = await dbConnect.query('SELECT * FROM borrow');
    const nowdate = new Date().toISOString().split('T')[0];

    for(const row of rows) {
        const [user] = await dbConnect.query('SELECT * FROM user WHERE name = ?', [row.author]);
        if(nowdate == row.dateend && row.sending == true) {
            if (!detail[user[0].email]) {
                detail[user[0].email] = [];
            }
            detail[user[0].email].push(`หนังสือ ${row.name} ยืมในวันที่ ${row.datebegin}\n`);
            await dbConnect.query('UPDATE borrow SET sending = ?, status = ? WHERE author = ? AND name = ? ', [false, "หมดเวลาในการยืม", row.author, row.name]);
        }
    }
    for(const email in detail) {
        const content = detail[email].join('');
        sendEmail(content, email)
    }
})

app.listen(3000, () => {
    console.log("tHis SerVer iS rUnnINg On P0rT 3000!!!")
})
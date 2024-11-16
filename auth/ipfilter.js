const allowedIps = ['::1']

function ipFilter(req, res, next) {
    const client = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (allowedIps.includes(client)) {
        next();
    } else {
        res.render('nopermission');
    }
}

module.exports = ipFilter;
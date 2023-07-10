var pg = require('pg');
var dbConnection = require('../db/db_connection');

var pool = new pg.Pool(dbConnection);

exports.isAdminAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status(401).json({message: 'Unauthorized!'});
        return;
    }

    pool.query(`SELECT * FROM administrators WHERE email = $1`, [req.user.email], (err, result) => {
        if (err) {
            res.status(500).json({message: 'Server error!'});
        } else {
            if (result.rows.length > 0) {
                next();
            } else {
                res.status(403).json({message: 'Forbidden!'});
            }
        }
    });
};

// if logged in as admin, can't go to login page
exports.adminNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(403).json({message: 'Forbidden!'});
    }
    next();
}

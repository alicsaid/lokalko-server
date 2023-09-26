var pg = require('pg');
var dbConnection = require('../db/db_connection');
const jwt = require('jsonwebtoken');
const {compare} = require("bcrypt");

var pool = new pg.Pool(dbConnection);

const createToken = (req, res, next) => {
    const user = {user: req.user};
    const accessToken = generateAccessToken(user)
    req.token = {token: accessToken};
    next();
};

const authenticateUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    pool.connect(function (err, client, done) {
        if (err) {
            console.log("res 21 linija")
            return res.send(err);
        }

        client.query(`
            SELECT * FROM users WHERE email = $1
        `, [email], function (err, result) {
            done();

            if (err) {
                console.log("res 30 linija")
                return res.send(err);
            }

            if (result.rows.length === 0) {
                console.log("Invalid credentials")
                return res.status(401).json("Invalid credentials");
            }

            const user = result.rows[0];
            compare(password, user.password, function (err, passwordMatch) {
                if (err) {
                    console.log("res 42 linija")
                    return res.send(err);
                }

                if (!passwordMatch) {
                    console.log("Invalid credentials")
                    return res.status(401).json("Invalid credentials");
                }

                console.log(user)

                req.user = user;
                next();
            });
        });
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token === null) return res.sendStatus(401);
    jwt.verify(token, "verygoodsecretkey", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

function generateAccessToken(user) {
    return jwt.sign(user, "verygoodsecretkey")
}

function decodeAccessToken(req, res, next) {

    console.log(req.headers)

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    try {
        const decodedToken = jwt.verify(token, "verygoodsecretkey");
        console.log("DECODED TOKEN", decodedToken.user.user_id);
        req.token = decodedToken.user
        next()
    } catch (error) {
        console.error('Error decoding JWT:', error);
    }
}

module.exports = {
    createToken,
    authenticateUser,
    authenticateToken,
    decodeAccessToken
}
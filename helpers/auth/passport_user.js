const dbConnection = require('../db/db_connection');
const pg = require('pg');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const pool = new pg.Pool(dbConnection);

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        pool.query('SELECT * FROM users WHERE email = $1;', [email], (err, result) => {
            if (err) {
                return done(err);
            }

            if (result.rows.length > 0) {
                const user = result.rows[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return done(err);
                    }

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Password incorrect!'});
                    }
                });
            } else {
                return done(null, false, {message: 'Email not registered!'});
            }
        });
    };

    passport.use('user', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.user_id));

    passport.deserializeUser((id, done) => {
        pool.query('SELECT * FROM users WHERE user_id = $1;', [id], (err, result) => {
            if (err) {
                return done(err);
            }
            return done(null, result.rows[0]);
        });
    });
}

module.exports = initialize;

var express = require('express');
var router = express.Router();
const passport = require('passport');
var queries = require("../helpers/db/queries")

/* passport */
const initializeAdmin = require('../helpers/auth/passport_admin');
initializeAdmin(passport);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({ title: "Hello from Lokalko team!" });
});

module.exports = router;

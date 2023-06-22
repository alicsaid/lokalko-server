var express = require('express');
var router = express.Router();
const passport = require('passport');
var queries = require("../helpers/db/queries")

/* passport */
const initializeUser = require('../helpers/auth/passport_user');
initializeUser(passport);

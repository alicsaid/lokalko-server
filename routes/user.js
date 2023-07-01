var express = require('express');
var router = express.Router();
const passport = require('passport');
var queries = require("../helpers/db/queries")

/* passport */
const initializeUser = require('../helpers/auth/passport_user');
initializeUser(passport);

/* REQUESTS */

/* GET requests. */
router.get('/requests/:user_id/user', queries.getRequestsByUser, function (req, res, next) {
    //console.info(req.requests)
    if (req.requests) {
        res.status(200).json({requests: req.requests});
    } else if (!req.requests) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

/* GET requests. */
router.get('/requests/:city_id/city', queries.getRequestsByCity, function (req, res, next) {
    //console.info(req.requests)
    if (req.requests) {
        res.status(200).json({requests: req.requests});
    } else if (!req.requests) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

/* GET requests. */
router.get('/requests/:request_id/request', queries.getRequestById, function (req, res, next) {
    //console.info(req.request)
    if (req.request) {
        res.status(200).json({request: req.request});
    } else if (!req.request) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

/* GET requests. */
router.post('/request', queries.postRequest, function (req, res, next) {
    res.sendStatus(200);
});

/* GET user_data. */
router.get('/:user_id/user-data', queries.getUserData, function (req, res, next) {
    //console.info(req.userData)
    res.json({userData: req.userData});
});

/* GET categories. */
router.get('/categories', queries.getCategories, function (req, res, next) {
    if (req.categories) {
        res.status(200).json({categories: req.categories});
    } else if (!req.categories) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

/* GET severities. */
router.get('/severities', queries.getSeverities, function (req, res, next) {
    if (req.severities) {
        res.status(200).json({severities: req.severities});
    } else if (!req.severities) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

/* GET cities. */
router.get('/cities', queries.getCities, function (req, res, next) {
    if (req.cities) {
        res.status(200).json({cities: req.cities});
    } else if (!req.cities) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
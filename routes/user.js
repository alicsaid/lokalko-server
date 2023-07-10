var express = require('express');
var router = express.Router();
const passport = require('passport');
var queries = require("../helpers/db/queries")
const multer = require('multer');
const path = require("path");

/* multer */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/requestImages/')
    },
    filename: (req, file, cb) => {
        //console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

/* passport */
const initializeUser = require('../helpers/auth/passport_user');
initializeUser(passport);

/* ---------- AUTH ---------- */

/* POST login */
router.post('/login', passport.authenticate('user'), (req, res) => {
    req.login(req.user, function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).json({message: 'Logged in!'});
    });
});

/* GET logout */
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).json({message: 'Logged out!'});
    });
});

/* POST register */
router.post('/register', queries.register, function (req, res, next) {
    res.status(200).json({success: 'User registered!'});
});


/* ---------- DASHBOARD ---------- */

/* GET analytics */
router.get('/dashboard-analytics', queries.getRequestsAnalyticsByUser, function (req, res, next) {
    //console.info(req.totalRequests)
    if (req.totalRequests) {
        res.status(200).json({totalRequests: req.totalRequests});
    } else if (!req.requests) {
        res.status(404).json({error: 'Resource not found'});
    } else {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

/* ---------- REQUESTS ---------- */

/* GET requests */
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

/* GET requests */
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

/* POST request */
router.post('/request', queries.postRequest, upload.array('images', 3), function (req, res, next) {
    res.status(200).json({success: 'Issue reported!'});
});

/* ---------- USER ---------- */

/* GET user_data. */
router.get('/:user_id/user-data', queries.getUserData, function (req, res, next) {
    //console.info(req.userData)
    res.json({userData: req.userData});
});

/* PUT user_data. */
router.put('/:user_id/user-data', queries.updateUser, function (req, res, next) {
    res.json({message: "User info updated!"});
});

module.exports = router;
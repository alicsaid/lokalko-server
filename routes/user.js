var express = require('express');
var router = express.Router();
var queries = require("../helpers/db/queries")
const {createToken, authenticateUser, authenticateToken, decodeAccessToken} = require("../helpers/auth/jwt_auth");

/* ---------- AUTH ---------- */

/* POST login */
router.post('/login', authenticateUser, createToken, (req, res, next) => {
    //console.info(req.token);
    res.status(200).json(req.token);
});

/* GET logout */
router.get('/logout', function (req, res) {
    console.log(`Logged out - ${req.body.email}!`);
    res.status(200).json({message: 'Logged out!'});
});

/* POST register */
router.post('/register', queries.register, createToken, function (req, res, next) {
    res.status(200).json(req.token);
});

/* ---------- DASHBOARD ---------- */

/* GET analytics */
router.get('/dashboard-analytics', decodeAccessToken, queries.getRequestsAnalyticsByUser, function (req, res, next) {
    //console.info("total" + req.totalRequests)
    if (req.totalRequests) {
        res.status(200).json({totalRequests: req.totalRequests});
    } else if (!req.requests) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET reportedIssues */
router.get('/reported-issues', queries.getReportedIssues, function (req, res, next) {
    console.info(req.reportedIssues)
    if (req.reportedIssues) {
        res.status(200).json({reportedIssues: req.reportedIssues});
    } else if (!req.requests) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET resolvedIssues */
router.get('/resolved-issues', queries.getResolvedIssues, function (req, res, next) {
    console.info(req.resolvedIssues)
    if (req.resolvedIssues) {
        res.status(200).json({resolvedIssues: req.resolvedIssues});
    } else if (!req.requests) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* ---------- REQUESTS ---------- */

/* GET requests */
router.get('/requests/user', decodeAccessToken, queries.getRequestsByUser, function (req, res, next) {
    //console.info(req.requests)
    if (req.requests) {
        res.status(200).json({requests: req.requests});
    } else if (!req.requests) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET city - MAP */
router.get('/city-latlang', decodeAccessToken, queries.getCityData, function (req, res, next) {
    console.info(req.city)
    if (req.city) {
        res.status(200).json(req.city);
    } else if (!req.city) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET requests */
router.get('/requests/city', decodeAccessToken, queries.getRequestsByCity, function (req, res, next) {
    //console.info(req.requests)
    if (req.requests) {
        res.status(200).json({requests: req.requests});
    } else if (!req.requests) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET requests. */
router.get('/requests/request', queries.getRequestById, function (req, res, next) {
    //console.info(req.request)
    if (req.request) {
        console.info(req.request)
        res.status(200).json(req.request);
    } else if (!req.request) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET categories. */
router.get('/categories', queries.getCategories, function (req, res, next) {
    if (req.categories) {
        res.status(200).json({categories: req.categories});
    } else if (!req.categories) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET severities. */
router.get('/severities', queries.getSeverities, function (req, res, next) {
    if (req.severities) {
        res.status(200).json({severities: req.severities});
    } else if (!req.severities) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* GET cities. */
router.get('/cities', queries.getCities, function (req, res, next) {
    if (req.cities) {
        res.status(200).json({cities: req.cities});
    } else if (!req.cities) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* POST request */
router.post('/request', queries.postRequest, function (req, res, next) {
    res.status(200).json({message: 'Issue reported!'});
});

/* ---------- USER ---------- */

/* GET user_data. */
router.get('/user-data', decodeAccessToken, queries.getUserData, function (req, res, next) {
    if (req.userData) {
        res.status(200).json(req.userData);
    } else if (!req.userData) {
        sendErrorResponse(res, 404, 'Resource not found');
    } else {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

/* PUT user_data. */
router.put('/user-data', decodeAccessToken, queries.updateUser, function (req, res, next) {
    res.json({message: 'User info updated!'});
});

/* MISC */

function sendErrorResponse(res, code, message) {
    res.status(code).json({error: message});
}

module.exports = router;

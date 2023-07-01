var express = require('express');
var router = express.Router();
const passport = require('passport');
var queries = require("../helpers/db/queries")

/* passport */
const initializeAdmin = require('../helpers/auth/passport_admin');
initializeAdmin(passport);

/* REQUESTS */

/* GET requests. */
router.get('/requests', queries.getAllRequests, function (req, res, next) {
    //console.info(req.requests)
    res.json({requests: req.requests});
});

/* ARCHIVED REQUESTS */

/* GET archived requests. */
router.get('/archived-requests', queries.getAllArchivedRequests, function (req, res, next) {
    //console.info(req.archivedRequests)
    res.json({archivedRequests: req.archivedRequests});
});

/* USERS */

/* GET users. */
router.get('/users', queries.getAllUsers, function (req, res, next) {
    //console.info(req.users)
    res.json({users: req.users});
});

/* SERVICES */

/* GET services. */
router.get('/services', queries.getAllServices, function (req, res, next) {
    //console.info(req.services)
    res.json({services: req.services});
});

/* OTHER */

/* GET statuses. */
router.get('/statuses', queries.getStatuses, function (req, res, next) {
    res.json({statuses: req.statuses});
});

/* GET severity. */
router.get('/severity', queries.getSeverities, function (req, res, next) {
    res.json({severity: req.severity});
});

/* GET categories. */
router.get('/categories', queries.getCategories, function (req, res, next) {
    res.json({categories: req.categories});
});

module.exports = router;
var express = require('express');
var router = express.Router();
const passport = require('passport');
var queries = require("../helpers/db/queries")
var checkAuth = require("../helpers/auth/check_auth");

/* passport */
const initializeAdmin = require('../helpers/auth/passport_admin');
initializeAdmin(passport);

/* ---------- AUTH ---------- */

/* POST login */
router.post('/login', passport.authenticate('admin'), (req, res) => {
    req.login(req.user, function (err) {
        if (err) {
            return next(err);
        }
        res.json({message: 'Logged in successfully!'});
    });
});

/* POST logout */
router.post('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.json({message: 'Logged out successfully!'});
    });
});

/* ---------- DASHBOARD ---------- */

/* GET analytics */
router.get('/dashboard-analytics', checkAuth.isAdminAuthenticated, queries.getRequestsAnalytics, queries.getFinishedRequestsAnalytics, queries.getUsersAnalytics, function (req, res, next) {
    //console.info("TOTAL", req.totalRequests, "FINISHED", req.finishedRequests, "USERS", req.userCount)
    res.json({totalRequests: req.totalRequests, finishedRequests: req.finishedRequests, userData: req.userCount});
});

/* ---------- REQUESTS ---------- */

/* GET requests */
router.get('/requests', checkAuth.isAdminAuthenticated, queries.getAllRequests, function (req, res, next) {
    //console.info(req.requests)
    res.json({requests: req.requests});
});

/* PATCH request */
router.patch('/requests/:requestId/archive', checkAuth.isAdminAuthenticated, queries.archiveRequest, function (req, res, next) {
    res.json({message: "Request archived!"});
});

/* PATCH request */
router.patch('/requests/:requestId/update', checkAuth.isAdminAuthenticated, queries.updateRequest, function (req, res, next) {
    res.json({message: "Request updated!"});
});

/* DELETE request */
router.delete('/requests/:requestId/delete', checkAuth.isAdminAuthenticated, queries.deleteRequest, function (req, res, next) {
    res.json({message: "Request deleted!"});
});

/* GET statuses */
router.get('/statuses', checkAuth.isAdminAuthenticated, queries.getStatuses, function (req, res, next) {
    res.json({statuses: req.statuses});
});

/* GET severities */
router.get('/severities', checkAuth.isAdminAuthenticated, queries.getSeverities, function (req, res, next) {
    res.json({severities: req.severities});
});

/* GET categories */
router.get('/categories', checkAuth.isAdminAuthenticated, queries.getCategories, function (req, res, next) {
    res.json({categories: req.categories});
});

/* ---------- ARCHIVED REQUESTS ---------- */

/* GET archived requests */
router.get('/archived-requests', checkAuth.isAdminAuthenticated, queries.getAllArchivedRequests, function (req, res, next) {
    //console.info(req.archivedRequests)
    res.json({archivedRequests: req.archivedRequests});
});

/* DELETE archived request */
router.delete('/archived-requests/:requestId/delete', checkAuth.isAdminAuthenticated, queries.deleteRequest, function (req, res, next) {
    res.json({message: "Request deleted!"});
});

/* ---------- USERS ---------- */

/* GET users */
router.get('/users', checkAuth.isAdminAuthenticated, queries.getAllUsers, function (req, res, next) {
    //console.info(req.users)
    res.json({users: req.users});
});

/* DELETE user */
router.delete('/users/:userId/delete', checkAuth.isAdminAuthenticated, queries.deleteUser, function (req, res, next) {
    res.json({message: "User deleted!"});
});

/* ---------- SERVICES ---------- */

/* GET services */
router.get('/services', checkAuth.isAdminAuthenticated, queries.getAllServices, function (req, res, next) {
    //console.info(req.services)
    res.json({services: req.services});
});

/* POST service */
router.post('/services/create', checkAuth.isAdminAuthenticated, queries.createService, function (req, res, next) {
    res.json({message: "Service created!"});
});


/* PUT service */
router.put('/services/:serviceId/update', checkAuth.isAdminAuthenticated, queries.updateService, function (req, res, next) {
    res.json({message: "Service updated!"});
});

/* DELETE service */
router.delete('/services/:serviceId/delete', checkAuth.isAdminAuthenticated, queries.deleteService, function (req, res, next) {
    res.json({message: "Service deleted!"});
});

/* ---------- SETTINGS ---------- */

/* GET request category */
router.get('/categories', checkAuth.isAdminAuthenticated, queries.getCategories, function (req, res, next) {
    //console.info(req.categories)
    res.json({categories: req.categories});
});

/* POST request category */
router.post('/categories/create', checkAuth.isAdminAuthenticated, queries.createCategory, function (req, res, next) {
    res.json({message: "Category created!"});
});


/* PUT request category */
router.put('/categories/:categoryId/update', checkAuth.isAdminAuthenticated, queries.updateCategory, function (req, res, next) {
    res.json({message: "Category updated!"});
});

/* DELETE request category */
router.delete('/categories/:categoryId/delete', checkAuth.isAdminAuthenticated, queries.deleteCategory, function (req, res, next) {
    res.json({message: "Category deleted!"});
});

module.exports = router;
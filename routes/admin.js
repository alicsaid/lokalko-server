require('dotenv').config()
var express = require('express');
var router = express.Router();
var queries = require("../helpers/db/queries");
const {authenticateUser, createToken} = require("../helpers/auth/jwt_auth");

/* ---------- AUTH ---------- */

/* POST login */
router.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    console.log("email:", email, "-", "password:", password)
    console.log(`Logged in - Hello ${email}!`);

    res.json({message: 'Logged in!'});
});

/* POST logout */
router.post('/logout', function (req, res) {
    console.log(`Logged out - ${req.body.email}!`);

    res.json({message: 'Logged out!'});
});

/* ---------- DASHBOARD ---------- */

/* GET analytics */
router.get('/dashboard-analytics', queries.getRequestsAnalytics, queries.getFinishedRequestsAnalytics, queries.getUsersAnalytics, function (req, res, next) {
    //console.info("TOTAL", req.totalRequests, "FINISHED", req.finishedRequests, "USERS", req.userCount)
    res.json({totalRequests: req.totalRequests, finishedRequests: req.finishedRequests, userData: req.userCount});
});

/* ---------- REQUESTS ---------- */

/* GET requests */
router.get('/requests', queries.getAllRequests, function (req, res, next) {
    //console.info(req.requests)
    res.json({requests: req.requests});
});

/* PATCH request */
router.patch('/requests/:requestId/archive', queries.archiveRequest, function (req, res, next) {
    res.json({message: "Request archived!"});
});

/* PATCH request */
router.patch('/requests/:requestId/update', queries.updateRequest, function (req, res, next) {
    res.json({message: "Request updated!"});
});

/* DELETE request */
router.delete('/requests/:requestId/delete', queries.deleteRequest, function (req, res, next) {
    res.json({message: "Request deleted!"});
});

/* GET statuses */
router.get('/statuses', queries.getStatuses, function (req, res, next) {
    res.json({statuses: req.statuses});
});

/* GET severities */
router.get('/severities', queries.getSeverities, function (req, res, next) {
    res.json({severities: req.severities});
});

/* GET categories */
router.get('/categories', queries.getCategories, function (req, res, next) {
    res.json({categories: req.categories});
});

/* ---------- ARCHIVED REQUESTS ---------- */

/* GET archived requests */
router.get('/archived-requests', queries.getAllArchivedRequests, function (req, res, next) {
    //console.info(req.archivedRequests)
    res.json({archivedRequests: req.archivedRequests});
});

/* DELETE archived request */
router.delete('/archived-requests/:requestId/delete', queries.deleteRequest, function (req, res, next) {
    res.json({message: "Request deleted!"});
});

/* ---------- USERS ---------- */

/* GET users */
router.get('/users', queries.getAllUsers, function (req, res, next) {
    //console.info(req.users)
    res.json({users: req.users});
});

/* DELETE user */
router.delete('/users/:userId/delete', queries.deleteUser, function (req, res, next) {
    res.json({message: "User deleted!"});
});

/* ---------- SERVICES ---------- */

/* GET services */
router.get('/services', queries.getAllServices, function (req, res, next) {
    //console.info(req.services)
    res.json({services: req.services});
});

/* POST service */
router.post('/services/create', queries.createService, function (req, res, next) {
    res.json({message: "Service created!"});
});


/* PUT service */
router.put('/services/:serviceId/update', queries.updateService, function (req, res, next) {
    res.json({message: "Service updated!"});
});

/* DELETE service */
router.delete('/services/:serviceId/delete', queries.deleteService, function (req, res, next) {
    res.json({message: "Service deleted!"});
});

/* ---------- SETTINGS ---------- */

/* GET request category */
router.get('/categories', queries.getCategories, function (req, res, next) {
    //console.info(req.categories)
    res.json({categories: req.categories});
});

/* POST request category */
router.post('/categories/create', queries.createCategory, function (req, res, next) {
    res.json({message: "Category created!"});
});


/* PUT request category */
router.put('/categories/:categoryId/update', queries.updateCategory, function (req, res, next) {
    res.json({message: "Category updated!"});
});

/* DELETE request category */
router.delete('/categories/:categoryId/delete', queries.deleteCategory, function (req, res, next) {
    res.json({message: "Category deleted!"});
});

module.exports = router;
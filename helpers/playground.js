/* GET request by id. */
router.get('/request/:id', queries.getRequestById, function (req, res, next) {
    //console.info(req.request)
    res.json({ request: req.request });
});

/* GET requests from one user. */
router.get('/requestsFromUser', queries.getAllRequestsFromUser, function (req, res, next) {
    res.json({ requestsFromUser: req.requestsFromUser });
});
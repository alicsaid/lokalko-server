var pg = require('pg');
var dbConnection = require('./db_connection');

var pool = new pg.Pool(dbConnection);

/* REQUESTS */

/* Get all requests */
exports.getAllRequests = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.image, r.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                JOIN cities c ON r.city_id = c.city_id 
                JOIN request_categories rc ON r.category_id = rc.category_id 
                JOIN users u ON r.user_id = u.user_id 
                JOIN severity s ON r.severity_id = s.severity_id 
                JOIN services se ON r.service_id = se.service_id 
                JOIN status st ON r.status_id = st.status_id;
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.requests = result.rows;
            //console.info(req.requests);
            next();
        });
    });
};

/* Get request by ID */
exports.getRequestById = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.image, r.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                JOIN cities c ON r.city_id = c.city_id 
                JOIN request_categories rc ON r.category_id = rc.category_id 
                JOIN users u ON r.user_id = u.user_id 
                JOIN severity s ON r.severity_id = s.severity_id 
                JOIN services se ON r.service_id = se.service_id 
                JOIN status st ON r.status_id = st.status_id
                WHERE r.request_id = $1;
        `, [req.params.id], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.request = result.rows;
            next();
        });
    });
};

/* Get all requests from one user */
exports.getAllRequestsFromUser = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.image, r.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                JOIN cities c ON r.city_id = c.city_id 
                JOIN request_categories rc ON r.category_id = rc.category_id 
                JOIN users u ON r.user_id = u.user_id 
                JOIN severity s ON r.severity_id = s.severity_id 
                JOIN services se ON r.service_id = se.service_id 
                JOIN status st ON r.status_id = st.status_id
                WHERE u.user_id = 1;
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.requestsFromUser = result.rows;
            //console.info(req.requestsFromUser);
            next();
        });
    });
};

/* Get statuses */
exports.getStatuses = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT * FROM status 
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.statuses = result.rows;
            //console.info(req.statuses);
            next();
        });
    });
};

/* Get severity */
exports.getSeverity = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT * FROM severity
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.severity = result.rows;
            //console.info(req.severity);
            next();
        });
    });
};

/* Get categories */
exports.getCategories = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT * FROM request_categories
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.categories = result.rows;
            //console.info(req.categories);
            next();
        });
    });
};

/* ARCHIVED REQUESTS */

/* Get all requests */
exports.getAllArchivedRequests = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT ar.archived_request_id, ar.title, ar.description, ar.date, ar.time, ar.image, ar.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM archived_requests ar 
                JOIN cities c ON ar.city_id = c.city_id 
                JOIN request_categories rc ON ar.category_id = rc.category_id 
                JOIN users u ON ar.user_id = u.user_id 
                JOIN severity s ON ar.severity_id = s.severity_id 
                JOIN services se ON ar.service_id = se.service_id 
                JOIN status st ON ar.status_id = st.status_id;
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.archivedRequests = result.rows;
            //console.info(req.archivedRequests);
            next();
        });
    });
};

/* USERS */

// Get all users
exports.getAllUsers = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT u.*, c.city, g.gender
            FROM users u
            JOIN cities c ON u.city_id = c.city_id
            JOIN genders g ON u.gender_id = g.gender_id;
        `, [], function (err, result) {
            done();

            if (err) {
                return res.send(err);
            }
            req.users = result.rows;
            //console.info(req.users);
            next();
        });
    });
};

/* SERVICES */

// Get all services with city information
exports.getAllServices = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`
      SELECT s.*, c.city
      FROM services s
      JOIN cities c ON s.city_id = c.city_id; 
    `,
            [],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }

                req.services = result.rows;
                //console.info(req.services);
                next();
            }
        );
    });
};


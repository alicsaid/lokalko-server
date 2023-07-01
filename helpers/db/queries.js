var pg = require('pg');
var dbConnection = require('./db_connection');
const moment = require('moment');

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
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE r.archived = $1;;
        `, [false], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }

            // Format the date using Moment.js
            const formattedRequests = result.rows.map(row => ({
                ...row,
                date: moment(row.date).format('MMMM D, YYYY'),
                time: moment(row.time, 'HH:mm:ss').format('HH:mm')
            }));

            req.requests = formattedRequests;
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
        `, [req.params.request_id], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }

            // Format the date using Moment.js
            const formattedRequests = result.rows.map(row => ({
                ...row,
                date: moment(row.date).format('MMMM D, YYYY'),
                time: moment(row.time, 'HH:mm:ss').format('HH:mm')
            }));

            req.request = formattedRequests;
            console.log(req.request)
            next();
        });
    });
};

/* Get all requests from one user */
exports.getRequestsByUser = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.image, r.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE u.user_id = $1
                ORDER BY r.date;
        `, [req.params.user_id], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }

            // Format the date using Moment.js
            const formattedRequests = result.rows.map(row => ({
                ...row,
                date: moment(row.date).format('MMMM D, YYYY'),
                time: moment(row.time, 'HH:mm:ss').format('HH:mm')
            }));

            req.requests = formattedRequests;
            //console.info(req.requests);
            next();
        });
    });
};

/* Get all requests from one city */
exports.getRequestsByCity = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.image, r.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE c.city_id = $1
                ORDER BY r.date;
        `, [req.params.city_id], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }

            // Format the date using Moment.js
            const formattedRequests = result.rows.map(row => ({
                ...row,
                date: moment(row.date).format('MMMM D, YYYY'),
                time: moment(row.time, 'HH:mm:ss').format('HH:mm')
            }));

            req.requests = formattedRequests;
            //console.info(req.requests);
            next();
        });
    });
};

exports.postRequest = (req, res, next) => {

    var data = {
        title: req.body.title,
        description: req.body.description,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        address: req.body.address,
        image: "test",
        city_id: req.body.city_id,
        category: req.body.category_id,
        user_id: 1,
        severity_id: req.body.severity_id,
        service_id: "test",
        status_id: req.body.status_id
    }

    //console.info(data);

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`insert into requests(title, description, date, time, image, address, city_id, category_id, user_id, severity_id, service_id, status_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`, [data.title, data.description, data.date, data.time, data.image, data.address, data.city_id, data.category_id, data.user_id, data.severity_id, data.service_id, data.status_id], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }
            next()
        });
    });
};

/* Get all requests from one city */
exports.getUserData = (req, res, next) => {

    userId = req.params.user_id;

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
           SELECT *
                FROM users u
                LEFT JOIN cities c ON u.city_id = c.city_id
                WHERE u.user_id = $1;
        `, [userId], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }

            req.userData = result.rows;
            console.info(req.userData);
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
exports.getSeverities = (req, res, next) => {

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
            req.severities = result.rows;
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

/* Get categories */
exports.getCities = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT * FROM cities
        `, [], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            req.cities = result.rows;
            //console.info(req.cities);
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
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.image, r.address, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE r.archived = $1;
        `, [true], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }

            // Format the date using Moment.js
            const formattedRequests = result.rows.map(row => ({
                ...row,
                date: moment(row.date).format('MMMM D, YYYY'),
                time: moment(row.time, 'HH:mm:ss').format('HH:mm')
            }));

            req.archivedRequests = formattedRequests;
            console.info(req.archivedRequests);
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
            SELECT u.*, c.city
            FROM users u
            JOIN cities c ON u.city_id = c.city_id;
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


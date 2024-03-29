var pg = require('pg');
var dbConnection = require('./db_connection');
const moment = require('moment');
const {hashSync} = require("bcrypt");
const {decodeAccessToken} = require("../auth/jwt_auth");

var pool = new pg.Pool(dbConnection);

/* ---------- REGISTER ---------- */

/* POST register I */
exports.register = (req, res, next) => {

    var data = {
        email: req.body.email,
        password: hashSync(req.body.password, 10),
        city: req.body.city,
        first_name: req.body.firstName,
        last_name: req.body.lastName
    }

    console.info(data);

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query('SELECT city_id FROM cities WHERE city = $1;', [data.city], function (err, result) {
            if (err) {
                done();
                return res.send(err);
            }

            if (result.rows.length > 0) {
                // Grad već postoji, koristimo postojeći city_id
                const cityId = result.rows[0].city_id;
                insertUser(client, done, data, cityId, req, res, next);
            } else {
                // Grad ne postoji, prvo dodajemo grad
                client.query('INSERT INTO cities (city) VALUES ($1) RETURNING city_id;', [data.city], function (err, result) {
                    if (err) {
                        done();
                        return res.send(err);
                    }

                    const cityId = result.rows[0].city_id;
                    insertUser(client, done, data, cityId, req, res, next);
                });
            }
        });
    });
};

/* POST register II */
const insertUser = (client, done, data, cityId, req, res, next) => {
    client.query('INSERT INTO users (email, password, city_id, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING user_id;', [data.email, data.password, cityId, data.first_name, data.last_name], function (err, result) {
        done();

        if (err) {
            if (err.code === '23505' && err.constraint === 'users_email_key') {
                console.info('check email');
                return res.sendStatus(409)
            } else {
                console.error(err);
                return res.sendStatus(500)
            }
        }

        //req.email = data.email

        req.user = {
            user_id : result.rows[0].user_id,
            email : data.email,
            password : data.password,
            city_id : data.city_id,
            first_name : data.first_name,
            last_name : data.last_name
        }

        next();
    });
};

/* ---------- DASHBOARD ---------- */

/* GET requests */
exports.getRequestsAnalytics = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`SELECT COUNT(*) AS totalRequests FROM requests;`,
            [],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }
                //console.info(result.rows)
                req.totalRequests = result.rows;
                next();
            }
        );
    });
};

/* GET requests */
exports.getRequestsAnalyticsByUser = (req, res, next) => {

    console.log("TOKEN", req.token)

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`SELECT COUNT(*) AS totalRequests FROM requests WHERE user_id = $1;`,
            [req.token.user_id],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }
                //console.info(result.rows)
                req.totalRequests = parseInt(result.rows[0].totalrequests);
                next();
            }
        );
    });
};


/* GET reportedIssues */
exports.getReportedIssues = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`SELECT COUNT(*) AS reportedIssues FROM requests;`,
            [],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }
                //console.info(result.rows[0]);
                req.reportedIssues = parseInt(result.rows[0].reportedissues);
                next();
            }
        );
    });
};


/* GET resolvedIssues */
exports.getResolvedIssues = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`SELECT COUNT(*) AS resolvedIssues FROM requests WHERE status_id = $1;`,
            [3],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }
                //console.info(result.rows[0])
                req.resolvedIssues = parseInt(result.rows[0].resolvedissues);
                next();
            }
        );
    });
};


/* GET archived requests */
exports.getFinishedRequestsAnalytics = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`SELECT COUNT(*) AS finishedRequests FROM requests WHERE archived = true;`,
            [],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }

                req.finishedRequests = result.rows;
                next();
            }
        );
    });
};

/* GET users */
exports.getUsersAnalytics = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(
            `
      SELECT COUNT(*) AS userCount
      FROM users
      `,
            [],
            function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }

                req.userCount = result.rows;
                next();
            }
        );
    });
};

/* ---------- REQUESTS ---------- */

/* GET requests */
exports.getAllRequests = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.address, r.latitude, r.longitude, c.city AS city, rc.category AS category, rc.category_id AS category_id, u.email, s.severity AS severity, s.severity_id AS severity_id, se.service AS service, se.service_id AS service_id, st.status AS status, st.status_id AS status_id
                FROM requests r 
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE r.archived = $1
                ORDER BY r.date ASC;
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

/* PATCH request */
exports.archiveRequest = (req, res, next) => {
    const requestId = req.params.requestId;

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`UPDATE requests SET archived = true WHERE request_id = $1`, [requestId], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }
                next();
            }
        );
    });
};

/* PATCH request */
exports.updateRequest = (req, res, next) => {
    const requestId = req.params.requestId;

    let data = {
        category: req.body.category,
        service: req.body.service,
        severity: req.body.severity,
        status: req.body.status,
    }

    //console.log(data)

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`UPDATE requests SET category_id=$1, service_id=$2, severity_id=$3, status_id=$4 WHERE request_id = $5`, [data.category, data.service, data.severity, data.status, requestId], function (err, result) {
                done();

                if (err) {
                    return res.send(err);
                }

                next();
            }
        );
    });
};

/* DELETE request */
exports.deleteRequest = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`delete from requests where request_id = $1`, [req.params.requestId], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            next();
        });
    });
};

/* GET request */
exports.getRequestById = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.address, r.latitude, r.longitude, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                JOIN cities c ON r.city_id = c.city_id 
                JOIN request_categories rc ON r.category_id = rc.category_id 
                JOIN users u ON r.user_id = u.user_id 
                JOIN severity s ON r.severity_id = s.severity_id 
                JOIN services se ON r.service_id = se.service_id 
                JOIN status st ON r.status_id = st.status_id
                WHERE r.request_id = $1;
        `, [req.query.request_id], function (err, result) {
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

            req.request = formattedRequests[0];
            console.log(req.request)
            next();
        });
    });
};

/* GET requests */
exports.getRequestsByUser = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.address, r.latitude, r.longitude, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE u.user_id = $1
                ORDER BY r.date;
        `, [req.token.user_id], function (err, result) {
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

/* GET city */
exports.getCityData = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT * from cities WHERE city_id = $1
        `, [req.token.city_id], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }

            req.city = result.rows[0];
            //console.info(req.city);
            next();
        });
    });
};


/* GET requests */
exports.getRequestsByCity = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.address, r.latitude, r.longitude, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
                FROM requests r 
                LEFT JOIN cities c ON r.city_id = c.city_id 
                LEFT JOIN request_categories rc ON r.category_id = rc.category_id 
                LEFT JOIN users u ON r.user_id = u.user_id 
                LEFT JOIN severity s ON r.severity_id = s.severity_id 
                LEFT JOIN services se ON r.service_id = se.service_id 
                LEFT JOIN status st ON r.status_id = st.status_id
                WHERE c.city_id = $1
                ORDER BY r.date;
        `, [req.token.city_id], function (err, result) {
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

/* POST request */
exports.postRequest = (req, res, next) => {

    var data = {
        title: req.body.title,
        description: req.body.description,
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HH:mm:ss'),
        // date: new Date().toLocaleDateString(),
        // time: new Date().toLocaleTimeString(),
        address: req.body.address,
        city_id: req.body.city_id,
        category_id: req.body.category_id,
        user_id: req.token.user_id,
        severity_id: req.body.severity_id,
        service_id: 22,
        status_id: 1,
        archived: false,
        latitude: req.body.latitude,
        longitude: req.body.longitude
    }

    console.info(req.body);

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`insert into requests(title, description, date, time, address, city_id, category_id, user_id, severity_id, service_id, status_id, archived, latitude, longitude) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`, [data.title, data.description, data.date, data.time, data.address, data.city_id, data.category_id, data.user_id, data.severity_id, data.service_id, data.status_id, data.archived, data.latitude, data.longitude], function (err, result) {
            done()

            if (err) {
                return res.send(err);
            }
            next()
        });
    });
};

/* GET statuses */
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

/* GET severities */
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
            //console.info(req.severities);
            next();
        });
    });
};

/* GET cities */
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

/* ---------- ARCHIVED REQUESTS ---------- */

/* GET archived requests */
exports.getAllArchivedRequests = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`
            SELECT r.request_id, r.title, r.description, r.date, r.time, r.address, r.latitude, r.longitude, c.city AS city, rc.category AS category, u.email, s.severity AS severity, se.service AS service, st.status AS status 
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
            //console.info(req.archivedRequests);
            next();
        });
    });
};

/* ---------- USERS ---------- */

/* GET users */
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

/* GET user */
exports.getUserData = (req, res, next) => {

    userId = req.token.user_id;

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

            req.userData = result.rows[0] = {
                user_id: result.rows[0].user_id,
                email: result.rows[0].email,
                city_id: result.rows[0].city_id,
                first_name: result.rows[0].first_name,
                last_name: result.rows[0].last_name,
                city: result.rows[0].city
            }

            console.info(req.userData);
            next();
        });
    });
};

/* PUT user I */
exports.updateUser = (req, res, next) => {
    const {user_id} = req.token;
    const {first_name, last_name, city, email} = req.body;

    console.log(req.query)
    console.log(req.body)

    pool.connect((err, client, done) => {
        if (err) {
            return res.send(err);
        }

        // Get city_id for the provided city
        client.query('SELECT city_id FROM cities WHERE city = $1;', [city], (err, result) => {
            if (err) {
                done();
                return res.send(err);
            }

            if (result.rows.length > 0) {
                // City exists, use the existing city_id
                const cityId = result.rows[0].city_id;
                updateUserWithCityId(client, done, user_id, first_name, last_name, cityId, email, res, next);
            } else {
                // City does not exist, insert it into the cities table
                insertCity(client, done, city, (err, cityId) => {
                    if (err) {
                        done();
                        return res.send(err);
                    }

                    updateUserWithCityId(client, done, user_id, first_name, last_name, cityId, email, res, next);
                });
            }
        });
    });
};

/* PUT user II */
const updateUserWithCityId = (client, done, user_id, first_name, last_name, cityId, email, res, next) => {

    console.log(user_id, first_name, last_name, cityId, email)

    const query = `UPDATE users SET email = $4, city_id = $3, first_name = $1, last_name = $2 WHERE user_id = $5;`;

    const values = [first_name, last_name, cityId, email, user_id];

    client.query(query, values, (err, result) => {
        done();

        if (err) {
            return res.send(err);
        }

        next();
    });
};

/* PUT user III */
const insertCity = (client, done, city, callback) => {
    const query = 'INSERT INTO cities (city) VALUES ($1) RETURNING city_id;';
    const values = [city];

    client.query(query, values, (err, result) => {
        if (err) {
            callback(err);
        } else {
            const cityId = result.rows[0].city_id;
            callback(null, cityId);
        }
    });
};

/* DELETE request */
exports.deleteUser = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`delete from users where user_id = $1`, [req.params.userId], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            next();
        });
    });
};

/* ---------- SERVICES ---------- */

/* GET services */
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

/* POST service I */
exports.createService = (req, res, next) => {

    const data = {
        service: req.body.service,
        address: req.body.address,
        city: req.body.city,
        telephone: req.body.telephone,
    };

    pool.connect((err, client, done) => {
        if (err) {
            return res.send(err);
        }

        client.query('SELECT city_id FROM cities WHERE city = $1;', [data.city], (err, result) => {
            if (err) {
                done();
                return res.send(err);
            }

            if (result.rows.length > 0) {
                // City already exists, use the existing city_id
                const cityId = result.rows[0].city_id;
                insertService(client, done, data, cityId, res, next);
            } else {
                // City does not exist, insert the city first
                client.query('INSERT INTO cities (city) VALUES ($1) RETURNING city_id;', [data.city], (err, result) => {
                    if (err) {
                        done();
                        return res.send(err);
                    }

                    const cityId = result.rows[0].city_id;
                    insertService(client, done, data, cityId, res, next);
                });
            }
        });
    });
};

/* POST service II */
const insertService = (client, done, data, cityId, res, next) => {
    client.query('INSERT INTO services (service, address, city_id, telephone) VALUES ($1, $2, $3, $4);', [data.service, data.address, cityId, data.telephone], (err) => {
        done();

        if (err) {
            if (err.code === '23505' && err.constraint === 'services_service_key') {
                return res.json('Service already exists');
            } else {
                return res.send(err);
            }
        }

        next();
    });
};

/* PUT service */
exports.updateService = (req, res, next) => {
    const {serviceId} = req.params;
    const {service, address, city, telephone} = req.body;

    pool.connect((err, client, done) => {
        if (err) {
            return res.send(err);
        }

        client.query('SELECT city_id FROM cities WHERE city = $1;', [city], (err, result) => {
            if (err) {
                done();
                return res.send(err);
            }

            if (result.rows.length > 0) {
                // City already exists, use the existing city_id
                const cityId = result.rows[0].city_id;
                updateService2(client, done, serviceId, service, address, cityId, telephone, res, next);
            } else {
                // City does not exist, insert the city first
                client.query('INSERT INTO cities (city) VALUES ($1) RETURNING city_id;', [city], (err, result) => {
                    if (err) {
                        done();
                        return res.send(err);
                    }

                    const cityId = result.rows[0].city_id;
                    updateService2(client, done, serviceId, service, address, cityId, telephone, res, next);
                });
            }
        });
    });
};

const updateService2 = (client, done, serviceId, service, address, cityId, telephone, res, next,) => {
    const query = `UPDATE services SET service = $1, address = $2, city_id = $3, telephone = $4 WHERE service_id = $5;`;

    const values = [service, address, cityId, telephone, serviceId];

    client.query(query, values, (err, result) => {
        done();

        if (err) {
            return res.send(err);
        }

        next();
    });
}

/* DELETE service */
exports.deleteService = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`delete from services where service_id = $1`, [req.params.serviceId], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            next();
        });
    });
};

/* ---------- SETTINGS ---------- */

/* GET request categories */
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

/* POST request category */
exports.createCategory = (req, res, next) => {

    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`insert into request_categories(category) values($1);`, [req.body.category], function (err, result) {
            done()

            if (err) {
                if (err.code === '23505' && err.constraint === 'request_categories_category_key') {
                    return req.json("Category already exists")
                } else {
                    return res.send(err);
                }
            }
            next();
        });
    });
};

/* PUT request category */
exports.updateCategory = (req, res, next) => {
    const {categoryId} = req.params;
    const {category} = req.body;

    pool.connect((err, client, done) => {
        if (err) {
            return res.send(err);
        }

        const query = `UPDATE request_categories SET category = $1 WHERE category_id = $2;`;

        const values = [category, categoryId];

        client.query(query, values, (err, result) => {
            done();

            if (err) {
                return res.send(err);
            }

            next();
        });
    });
};

/* DELETE request category */
exports.deleteCategory = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }

        client.query(`delete from request_categories where category_id = $1`, [req.params.categoryId], function (err, result) {
            done()

            if (err) {
                return res.send(err)
            }
            next();
        });
    });
};

/* ---------- MISC ---------- */

/* hashing password */
exports.hashPassword = (req, res, next) => {
    password = req.body.password;
    pass2 = hashSync(req.body.password, 10);
    console.log(password, pass2)
}
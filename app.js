var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
// var userRouter = require('./routes/user');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* sessions */
app.use(session({
    secret: 'verygoodsecret',
    resave: false,
    saveUninitialized: false
}));

/* passport */
app.use(passport.initialize());
app.use(passport.session());

/* routes */
app.use('/', indexRouter);

/* protected routes */
app.use('/admin', adminRouter);
// app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

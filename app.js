// app.js
require('dotenv').config();

const createError   = require('http-errors');
const express       = require('express');
const path          = require('path');
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');

const indexRouter   = require('./routes/index');
const usersRouter   = require('./routes/users');
const filmsRouter   = require('./routes/films');
const authRouter    = require('./routes/auth'); // login/logout


const rentalsRouter = require('./routes/rentals');
const { isLoggedIn } = require('./controllers/auth.controller');

const filmsApiRouter   = require('./routes/films');       // jouw bestaande /api/films
const filmsPageRouter  = require('./routes/films.page');

const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Core middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }, // 1 uur
}));

// Beschikbaar maken in Pug
app.use((req, res, next) => {
  res.locals.sessionUser = req.session.user || null;
  res.locals.currentPath = req.path; // bv. '/auth/login'
  next();
});

// Routes
app.use('/auth', authRouter);              // login/logout
app.use('/', indexRouter);
app.use('/api/films', filmsRouter);
app.use('/users', isLoggedIn, usersRouter); // alles onder /users vereist login
app.use('/rentals', isLoggedIn, rentalsRouter);      // protect met login
app.use('/films', isLoggedIn, filmsPageRouter);
app.use('/api/films', filmsApiRouter);  


// 404
app.use((req, res, next) => next(createError(404)));

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).render('error');
});


module.exports = app;

// app.js
require('dotenv').config();

const createError   = require('http-errors');
const express       = require('express');
const path          = require('path');
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');

const indexRouter     = require('./routes/index');
const usersRouter     = require('./routes/users');
const filmsApiRouter  = require('./routes/films');
const filmsPageRouter = require('./routes/films.page');
const authRouter      = require('./routes/auth');
const rentalsRouter   = require('./routes/rentals');
const healthRouter    = require('./routes/health');
const { isLoggedIn }  = require('./controllers/auth.controller');

const app = express();

const isProd = process.env.NODE_ENV === 'production';
if (isProd) app.set('trust proxy', 1);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60
  }
}));

app.use((req, res, next) => {
  res.locals.sessionUser = req.session.user || null;
  res.locals.currentPath = req.originalUrl;
  next();
});

app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/api/films', filmsApiRouter);
app.use('/users', isLoggedIn, usersRouter);
app.use('/rentals', isLoggedIn, rentalsRouter);
app.use('/films', isLoggedIn, filmsPageRouter);
app.use('/health', healthRouter);

// extra fallback zodat /health altijd werkt
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.locals.message = err.message || 'Er ging iets mis';
  const stack = req.app.get('env') === 'development' ? err.stack : '';
  res.status(status).render('error', { error: { status, stack } });
});

module.exports = app;

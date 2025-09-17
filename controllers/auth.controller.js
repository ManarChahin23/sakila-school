// controllers/auth.controller.js
const authService = require('../services/auth.service');

// GET /auth/login
function showLogin(req, res) {
  if (req.session.user) return res.redirect('/users');
  return res.render('auth/login', { title: 'Login', error: null, username: '' });
}

// POST /auth/login
function login(req, res) {
  const { username, password } = req.body;

  authService.login(username, password, (err, account) => {
    if (err) {
      const msg = err.message === 'VALIDATION'
        ? 'Vul gebruikersnaam en wachtwoord in.'
        : 'Ongeldige inloggegevens';
      return res.status(401).render('auth/login', {
        title: 'Login',
        error: msg,
        username
      });
    }

    // bewaar minimale info in de session
    req.session.user = account; // { id, name, role, username }

    // eventueel terug naar gevraagde pagina
    const to = req.session.returnTo || '/users';
    delete req.session.returnTo;
    return res.redirect(to);
  });
}

// GET /auth/logout (of POST als je dat routepad gebruikt)
function logout(req, res) {
  req.session.destroy(() => res.redirect('/auth/login'));
}

// Middleware: moet ingelogd zijn
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login');
}

// Middleware: rol vereist (bijv. requireRole('admin'))
function requireRole(role) {
  return (req, res, next) => {
    if (req.session?.user?.role === role) return next();
    return res.status(403).send('Forbidden');
  };
}

// GET /auth/register (alleen admin; zie routes)
function showRegister(req, res) {
  return res.render('auth/register', {
    title: 'Nieuw account (medewerker)',
    error: null,
    form: { role: 'staff' }
  });
}

// POST /auth/register (alleen admin; zie routes)
function register(req, res, next) {
  authService.register(req.body, (err, newId) => {
    if (err) {
      if (err.message === 'VALIDATION') {
        return res.status(400).render('auth/register', {
          title: 'Nieuw account (medewerker)',
          error: 'Vul alle verplichte velden in.',
          form: req.body
        });
      }
      if (err.message === 'DUP_USERNAME') {
        return res.status(409).render('auth/register', {
          title: 'Nieuw account (medewerker)',
          error: 'Gebruikersnaam bestaat al.',
          form: req.body
        });
      }
      return next(err);
    }
    return res.redirect('/users');
  });
}

module.exports = {
  showLogin,
  login,
  logout,
  isLoggedIn,
  requireRole,
  showRegister,
  register,
};

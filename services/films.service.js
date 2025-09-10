const filmsDao = require('../dao/films.dao');

function list(query, cb) {
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  filmsDao.findAll(limit, cb);
}

function getById(id, cb) {
  const n = Number(id);
  if (!Number.isInteger(n)) return cb(new Error('BAD_REQUEST'));
  filmsDao.findById(n, (err, film) => {
    if (err) return cb(err);
    if (!film) return cb(new Error('NOT_FOUND'));
    cb(null, film);
  });
}

module.exports = { list, getById };


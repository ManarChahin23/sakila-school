const svc = require('../services/films.service');
const logger = require('../util/logger'); // <-- fix hier!

function list(req, res) {
  svc.list(req.query, (err, rows) => {
    if (err) {
      logger.error('films list: ' + err.message);
      return res.status(500).json({ error: 'Failed to fetch films' });
    }
    res.json(rows);
  });
}

function getById(req, res) {
  svc.getById(req.params.id, (err, film) => {
    if (err) {
      if (err.message === 'BAD_REQUEST') return res.status(400).json({ error: 'Bad id' });
      if (err.message === 'NOT_FOUND')   return res.status(404).json({ error: 'Not found' });
      return res.status(500).json({ error: 'Failed to fetch film' });
    }
    res.json(film);
  });
}

module.exports = { list, getById };
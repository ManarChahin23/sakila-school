const express = require('express');
const router = express.Router();
const svc = require('../services/films.service');

router.get('/', (req, res) => res.redirect('/films/overview'));

router.get('/overview', (req, res) => {
  const store = req.query.store || '1';
  const q = req.query.q || '';
  svc.getOverview(store === 'all' ? null : store, q, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).render('error', { message: 'Kon filmoverzicht niet laden', error: { status: 500, stack: '' } });
    }
    res.render('films/overview', { title: 'Films', rows, store, q });
  });
});

module.exports = router;

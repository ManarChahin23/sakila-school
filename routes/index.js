var express = require('express');
var router = express.Router();
const svc = require('../services/films.service'); // service-laag

/* GET home page (SSR met Pug). */
router.get('/', function (req, res) {
  svc.list({ limit: 20 }, (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.render('index', { title: 'Sakila Films', films: rows });
  });
});

/* About-pagina voor user stories */
router.get('/about', function (req, res) {
  res.render('about', { title: 'About', stories: [] });
});

module.exports = router;

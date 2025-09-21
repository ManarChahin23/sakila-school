// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

// Ga gewoon naar klantenoverzicht
router.get('/', (req, res) => res.redirect('/users'));

module.exports = router;


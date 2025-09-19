// routes/index.js
const express = require('express');
const router = express.Router();

// Ga gewoon naar klantenoverzicht
router.get('/', (req, res) => res.redirect('/users'));

module.exports = router;

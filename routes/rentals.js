// routes/rentals.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/rentals.controller');
const svc  = require('../services/rentals.service');

router.get('/active', (req, res) => {
  const store = req.query.store || 'all';

  svc.listAllActive(store === 'all' ? null : store, (err, list) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .render('error', { message: 'Kon lopende verhuur niet laden', error: { status: 500, stack: '' } });
    }
   
    res.render('films/active', { title: 'Verhuurd', list, store });
  });
});

router.post('/create', ctrl.create);
router.post('/:id/return', ctrl.returnRental);

module.exports = router;



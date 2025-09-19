// routes/rentals.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/rentals.controller');
const svc  = require('../services/rentals.service');

/**
 * Overzicht van lopende rentals
 * GET /rentals/active?store=all|1|2
 *
 * LET OP: de view hoort te staan in: views/rentals/active.pug
 * (Als jij 'm onder views/films/active.pug hebt gezet, verplaats het bestand
 * of wijzig de res.render(...) hieronder naar 'films/active'.)
 */
router.get('/active', (req, res) => {
  const store = req.query.store || 'all';

  svc.listAllActive(store === 'all' ? null : store, (err, list) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .render('error', { message: 'Kon lopende verhuur niet laden', error: { status: 500, stack: '' } });
    }
    // Gebruik 'rentals/active' als je view daar staat.
    res.render('films/active', { title: 'Verhuurd', list, store });
    // Als jouw file nu onder views/films/active.pug staat, gebruik dan:
    // res.render('films/active', { title: 'Verhuurd', list, store });
  });
});

/**
 * Nieuwe rental aanmaken
 * POST /rentals/create
 * Body: customer_id, film_id, store_id
 * Controller redirect terug naar /users/:id/details
 */
router.post('/create', ctrl.create);

/**
 * Rental innemen
 * POST /rentals/:id/return
 * Body (optioneel): backToCustomer
 */
router.post('/:id/return', ctrl.returnRental);

// GEEN details-route meer registreren zolang je geen ctrl.details exporteert
// router.get('/:id/details', ctrl.details);

module.exports = router;

// controllers/rentals.controller.js
const svc = require('../services/rentals.service');

// POST /rentals/create
exports.create = (req, res) => {
  const customerId = req.body.customerId || req.body.customer_id || req.body.customer;
  const filmId     = req.body.filmId     || req.body.film_id;
  const storeId    = req.body.storeId    || req.body.store_id;
  const staffId    = (req.session?.user?.staff_id) || (req.user?.id) || 1;

  svc.create(customerId, filmId, storeId, staffId, (err, rentalId) => {
    if (err) {
      const msg = err.message === 'NO_INVENTORY'
        ? 'Geen exemplaar beschikbaar in deze store.'
        : (err.message === 'VALIDATION' ? 'Ongeldige invoer voor uitlenen.' : 'Kon uitlening niet aanmaken.');
      return res
        .status(400)
        .render('error', { message: msg, error: { status: 400, stack: '' } });
    }
    // Terug naar user-details met melding
    res.redirect(`/users/${customerId}/details?rentOk=new`);
  });
};

// POST /rentals/:id/return
exports.returnRental = (req, res) => {
  svc.returnRental(req.params.id, (err, affected) => {
    if (err) {
      return res.status(400).render('error', { message: 'Kon inname niet verwerken.', error: { status: 400, stack: '' } });
    }
    if (!affected) {
      return res.status(404).render('error', { message: 'Rental niet gevonden of al ingenomen.', error: { status: 404, stack: '' } });
    }
    const backTo = req.body.backToCustomer;
    if (backTo) return res.redirect(`/users/${backTo}/details?rentOk=returned`);
    res.redirect('/users');
  });
};

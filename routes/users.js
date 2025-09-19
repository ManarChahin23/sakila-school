var express = require('express');
var router = express.Router();
const svc = require('../services/users.service');
const rentalsSvc = require('../services/rentals.service');



// Lijst (table) + zoeken + sorteren
router.get('/', (req, res) => {
  const { q = '', order = 'DESC' } = req.query; 
  svc.list({ limit: 20, order, q }, (err, users) => {
    if (err) return res.status(500).send('Database error');
    res.render('users/table', {
      title: 'Users',
      users,
      q, // voor de zoekbalk
      deleted:   req.query.deleted === '1',
      deletedId: req.query.id || null,    // voor Undo
      restored:  req.query.restored === '1'   // voor "hersteld"-banner
    });
  });
});


// Details (card + Edit/Cancel)
router.get('/:id/details', (req, res) => {
  svc.getById(req.params.id, (err, user) => {
    if (err) return res.status(500).send('Server error');

    rentalsSvc.listActiveForCustomer(req.params.id, (e2, rentals) => {
      const model = {
        title: `${user.first_name} ${user.last_name}`,
        user,
        users: user,
        success: req.query.success === '1',
        rentOk: req.query.rentOk || null,
        rentErr: req.query.rentErr || null,
        rentals: rentals || []
      };
      res.render('users/details', model);
    });
  });
});


// Edit-form
router.get('/:id/edit', (req, res) => {
  svc.getById(req.params.id, (err, user) => {
    if (err) return res.status(500).send('Server error');
    res.render('users/edit', {
      title: `Edit ${user.first_name}`,
      user,
      users: user,
      errors: {}
    });
  });
});

// Save (POST)
router.post('/:id/edit', (req, res) => {
  svc.update(req.params.id, req.body, (err) => {
    if (err) {
      if (err.message === 'VALIDATION_FIRST' || err.message === 'VALIDATION_LAST') {
        return svc.getById(req.params.id, (e, user) => {
          const model = {
            title: `Edit ${user?.first_name || 'User'}`,
            user:  { ...user, ...req.body },
            users: { ...user, ...req.body },
            errors: {
              first_name: err.message === 'VALIDATION_FIRST' ? 'First name is required' : undefined,
              last_name:  err.message === 'VALIDATION_LAST'  ? 'Last name is required'  : undefined
            }
          };
          res.status(400).render('users/edit', model);
        });
      }
      if (err.message === 'BAD_REQUEST') return res.status(400).send('Bad request');
      if (err.message === 'NOT_FOUND')   return res.status(404).send('Not found');
      return res.status(500).send('Server error');
    }
    res.redirect(`/users/${req.params.id}/details?success=1`);
  });
});

// Delete (POST)
router.post('/:id/delete', (req, res) => {
  svc.remove(req.params.id, (err) => {
    if (err) {
      if (err.message === 'BAD_REQUEST') return res.status(400).send('Bad request');
      if (err.message === 'NOT_FOUND')   return res.status(404).send('Not found');
      return res.status(500).send('Server error');
    }
    // id meesturen, zodat Undo verschijnt
    res.redirect(`/users?deleted=1&id=${req.params.id}`);
  });
});

// Restore (POST)
router.post('/:id/restore', (req, res) => {
  svc.restore(req.params.id, (err) => {
    if (err) {
      if (err.message === 'BAD_REQUEST') return res.status(400).send('Bad request');
      if (err.message === 'NOT_FOUND')   return res.status(404).send('Not found');
      return res.status(500).send('Server error');
    }
    res.redirect('/users?restored=1');
  });
});

// Create-form
router.get('/create', (req, res) => {
  res.render('users/create', {
    title: 'New user',
    user: { first_name: '', last_name: '', email: '' },
    errors: {}
  });
});

// Create (POST)
router.post('/create', (req, res) => {
  svc.create(req.body, (err, newId) => {
    if (err) {
      if (err.message === 'VALIDATION_FIRST' || err.message === 'VALIDATION_LAST') {
        return res.status(400).render('users/create', {
          title: 'New user',
          user: { ...req.body },
          errors: {
            first_name: err.message === 'VALIDATION_FIRST' ? 'First name is required' : undefined,
            last_name:  err.message === 'VALIDATION_LAST'  ? 'Last name is required'  : undefined
          }
        });
      }
      return res.status(500).send('Server error');
    }
    return res.redirect(`/users/${newId}/details?success=1`);
  });
});


module.exports = router;

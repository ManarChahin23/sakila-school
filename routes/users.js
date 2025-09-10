var express = require('express');
var router = express.Router();
const svc = require('../services/users.service');

// Lijst (table)
router.get('/', (req, res) => {
  svc.list({ limit: 20 }, (err, users) => {
    if (err) return res.status(500).send('Database error');
    res.render('users/table', { title: 'Users', users });
  });
});

// Details (card + Edit/Cancel)
router.get('/:id/details', (req, res) => {
  svc.getById(req.params.id, (err, user) => {
    if (err) return res.status(500).send('Server error');
    res.render('users/details', {
      title: `${user.first_name} ${user.last_name}`,
      user,
      users: user,
      success: req.query.success === '1' 
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


module.exports = router;

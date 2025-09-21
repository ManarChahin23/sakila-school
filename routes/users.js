// routes/users.js
const express = require('express');
const router = express.Router();
const svc = require('../services/users.service');
const rentalsSvc = require('../services/rentals.service');

// ---------- Create ----------
router.get('/create', (_req, res) => {
  res.render('users/create', {
    title: 'New user',
    user: { first_name: '', last_name: '', email: '' },
    errors: {}
  });
});

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
      return res
        .status(500)
        .render('error', { message: 'Kon gebruiker niet aanmaken', error: { status: 500, stack: '' } });
    }
    return res.redirect(`/users/${newId}/details?success=1`);
  });
});

// ---------- Lijst (met q + order + paginering) ----------
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const order = (req.query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 20;                             // aantal per pagina
  const offset = (page - 1) * limit;

  // Eerst de data voor de huidige pagina...
  svc.list({ limit, offset, order, q }, (err, users) => {
    if (err) return res.status(500).render('error', { message: 'Database error', error: { status: 500, stack: '' } });

    // ... en vervolgens totaal voor paginering
    svc.countAll(q, (err2, total) => {
      if (err2) return res.status(500).render('error', { message: 'Database error', error: { status: 500, stack: '' } });

      const totalPages = Math.max(Math.ceil(total / limit), 1);

      res.render('users/table', {
        title: 'Users',
        users,
        q,
        order,
        deleted:   req.query.deleted === '1',
        deletedId: req.query.id || null,
        restored:  req.query.restored === '1',
        // paginering
        currentPage: page,
        totalPages,
        total,
        limit
      });
    });
  });
});

// ---------- Details ----------
router.get('/:id/details', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).render('error', { message: 'Ongeldig id', error: { status: 400, stack: '' } });

  svc.getById(id, (err, user) => {
    if (err)   return res.status(500).render('error', { message: 'Server error', error: { status: 500, stack: '' } });
    if (!user) return res.status(404).render('error', { message: 'User niet gevonden', error: { status: 404, stack: '' } });

    rentalsSvc.listActiveForCustomer(id, (e2, rentals) => {
      const model = {
        title: `${user.first_name} ${user.last_name}`,
        user,
        success: req.query.success === '1',
        rentOk: req.query.rentOk || null,
        rentErr: req.query.rentErr || null,
        rentals: e2 ? [] : (rentals || [])
      };
      res.render('users/details', model);
    });
  });
});

// ---------- Edit ----------
router.get('/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).render('error', { message: 'Ongeldig id', error: { status: 400, stack: '' } });

  svc.getById(id, (err, user) => {
    if (err)   return res.status(500).render('error', { message: 'Server error', error: { status: 500, stack: '' } });
    if (!user) return res.status(404).render('error', { message: 'User niet gevonden', error: { status: 404, stack: '' } });

    res.render('users/edit', {
      title: `Edit ${user.first_name}`,
      user,
      errors: {}
    });
  });
});

router.post('/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).render('error', { message: 'Ongeldig id', error: { status: 400, stack: '' } });

  svc.update(id, req.body, (err) => {
    if (err) {
      if (err.message === 'VALIDATION_FIRST' || err.message === 'VALIDATION_LAST') {
        return svc.getById(id, (e, user) => {
          const u = e || !user ? {} : user;
          res.status(400).render('users/edit', {
            title: `Edit ${u.first_name || 'User'}`,
            user:  { ...u, ...req.body },
            errors: {
              first_name: err.message === 'VALIDATION_FIRST' ? 'First name is required' : undefined,
              last_name:  err.message === 'VALIDATION_LAST'  ? 'Last name is required'  : undefined
            }
          });
        });
      }
      if (err.message === 'BAD_REQUEST') return res.status(400).render('error', { message: 'Bad request', error: { status: 400, stack: '' } });
      if (err.message === 'NOT_FOUND')   return res.status(404).render('error', { message: 'Not found',   error: { status: 404, stack: '' } });
      return res.status(500).render('error', { message: 'Server error', error: { status: 500, stack: '' } });
    }
    return res.redirect(`/users/${id}/details?success=1`);
  });
});

// ---------- Soft delete / restore ----------
router.post('/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).render('error', { message: 'Ongeldig id', error: { status: 400, stack: '' } });

  svc.remove(id, (err) => {
    if (err) {
      if (err.message === 'BAD_REQUEST') return res.status(400).render('error', { message: 'Bad request', error: { status: 400, stack: '' } });
      if (err.message === 'NOT_FOUND')   return res.status(404).render('error', { message: 'Not found',   error: { status: 404, stack: '' } });
      return res.status(500).render('error', { message: 'Server error', error: { status: 500, stack: '' } });
    }
    res.redirect(`/users?deleted=1&id=${id}`);
  });
});

router.post('/:id/restore', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).render('error', { message: 'Ongeldig id', error: { status: 400, stack: '' } });

  svc.restore(id, (err) => {
    if (err) {
      if (err.message === 'BAD_REQUEST') return res.status(400).render('error', { message: 'Bad request', error: { status: 400, stack: '' } });
      if (err.message === 'NOT_FOUND')   return res.status(404).render('error', { message: 'Not found',   error: { status: 404, stack: '' } });
      return res.status(500).render('error', { message: 'Server error', error: { status: 500, stack: '' } });
    }
    res.redirect('/users?restored=1');
  });
});

module.exports = router;

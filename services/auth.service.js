// services/auth.service.js
const bcrypt = require('bcryptjs');
const dao = require('../dao/auth.dao');

/**
 * Login: haalt account op en vergelijkt het wachtwoord met bcrypt.
 * Geeft bij succes een minimal account-object terug (voor in req.session.user).
 */
exports.login = (username, password, cb) => {
  const u = String(username || '').trim().toLowerCase();
  const p = String(password || '');

  if (!u || !p) return cb(new Error('VALIDATION'));

  dao.findByUsername(u, (err, user) => {
    if (err) return cb(err);
    if (!user) return cb(new Error('INVALID'));

    const hash = user.password_hash || '';
    if (!hash.startsWith('$2')) {
      // we verwachten een bcrypt-hash
      return cb(new Error('INVALID'));
    }

    bcrypt.compare(p, hash, (e, ok) => {
      if (e) return cb(e);
      if (!ok) return cb(new Error('INVALID'));

      const account = {
        id: user.id,
        username: user.username,
        name: (user.first_name && user.last_name)
          ? `${user.first_name} ${user.last_name}`
          : user.username,
        role: user.role || 'staff',
        staff_id: user.staff_id || null   // ← belangrijk: meegeven aan session
      };
      return cb(null, account);
    });
  });
};

/**
 * Registratie (alleen admin): maakt nieuw account met bcrypt-hash.
 * - username: uniek (lowercased)
 * - role: 'admin' of 'staff' (default 'staff')
 * - staffId: optioneel koppelen aan staff.staff_id
 */
exports.register = (form, cb) => {
  const username = String(form.username || '').trim().toLowerCase();
  const password = String(form.password || '').trim();
  const role     = form.role === 'admin' ? 'admin' : 'staff';
  const staffId  = form.staff_id ? Number(form.staff_id) : null;

  if (!username || !password) return cb(new Error('VALIDATION'));

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return cb(err);

    dao.createAccount(username, hash, role, staffId, (e, newId) => {
      if (e) {
        if (e.code === 'ER_DUP_ENTRY') return cb(new Error('DUP_USERNAME'));
        return cb(e);
      }
      return cb(null, newId);
    });
  });
};

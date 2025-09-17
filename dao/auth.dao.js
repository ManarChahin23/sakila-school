// dao/auth.dao.js
const db = require('../config/db');

/**
 * Haal account + optioneel staff-naam op via username.
 * Verwacht kolom 'password_hash' in tabel 'account'.
 */
exports.findByUsername = (username, cb) => {
  const sql = `
    SELECT
      a.id,
      a.username,
      a.password_hash,
      a.role,
      s.first_name,
      s.last_name
    FROM account a
    LEFT JOIN staff s ON s.staff_id = a.staff_id
    WHERE a.username = ?
    LIMIT 1
  `;
  const u = String(username || '').trim().toLowerCase();

  db.query(sql, [u], (err, rows) => {
    if (err) return cb(err);
    const row = rows && rows[0];
    if (!row) return cb(null, null);

    cb(null, {
      id: row.id,
      username: row.username,
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      role: row.role,
      password_hash: row.password_hash
    });
  });
};

/**
 * Maak een nieuw account aan. Username moet uniek zijn.
 */
exports.createAccount = (username, passwordHash, role = 'staff', staffId = null, cb) => {
  const sql = `
    INSERT INTO account (username, password_hash, role, staff_id)
    VALUES (?, ?, ?, ?)
  `;
  const u = String(username || '').trim().toLowerCase();
  const r = role === 'admin' ? 'admin' : 'staff';

  db.query(sql, [u, passwordHash, r, staffId || null], (err, result) => {
    if (err) return cb(err);
    cb(null, result.insertId);
  });
};

// dao/auth.dao.js
const db = require('../config/db');

/**
 * Haal account + (optioneel) staff-naam op via username.
 * Verwacht kolom 'password_hash' in tabel 'account'.
 */
exports.findByUsername = (username, cb) => {
  const u = String(username || '').trim().toLowerCase();

  const sql = `
    SELECT
      a.id,
      a.username,
      a.password_hash,
      a.role,
      a.staff_id,        -- ← belangrijk voor rentals (wie verwerkt de huur)
      s.first_name,
      s.last_name
    FROM account a
    LEFT JOIN staff s ON s.staff_id = a.staff_id
    WHERE a.username = ?
    LIMIT 1
  `;

  db.query(sql, [u], (err, rows) => {
    if (err) return cb(err);
    const row = rows && rows[0];
    if (!row) return cb(null, null);

    cb(null, {
      id: row.id,
      username: row.username,
      role: row.role,
      staff_id: row.staff_id || null,     // ← meegeven
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      password_hash: row.password_hash    // bcrypt-hash
    });
  });
};

/**
 * Maak een nieuw account aan. Username moet uniek zijn.
 * - role: 'admin' of 'staff' (default: 'staff')
 * - staffId: optioneel (koppeling aan staff.staff_id)
 */
exports.createAccount = (username, passwordHash, role = 'staff', staffId = null, cb) => {
  const u = String(username || '').trim().toLowerCase();
  const r = role === 'admin' ? 'admin' : 'staff';

  const sql = `
    INSERT INTO account (username, password_hash, role, staff_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [u, passwordHash, r, staffId || null], (err, result) => {
    if (err) return cb(err);
    cb(null, result.insertId);
  });
};

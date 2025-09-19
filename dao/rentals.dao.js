// dao/rentals.dao.js
const db = require('../config/db');

// Zoek een vrije inventory_id voor film + store
exports.findAvailableInventoryId = (filmId, storeId, cb) => {
  const sql = `
    SELECT i.inventory_id
    FROM inventory i
    LEFT JOIN rental r
      ON r.inventory_id = i.inventory_id
     AND r.return_date IS NULL
    WHERE i.film_id = ?
      AND i.store_id = ?
      AND r.rental_id IS NULL
    LIMIT 1
  `;
  db.query(sql, [filmId, storeId], (err, rows) => {
    if (err) return cb(err);
    const row = rows && rows[0];
    cb(null, row ? row.inventory_id : null);
  });
};

// Rental aanmaken + payment registreren
// params: { customerId, filmId, inventoryId, staffId }
exports.createRental = ({ customerId, filmId, inventoryId, staffId }, cb) => {
  // 1) rental toevoegen
  const sql1 = `
    INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
    VALUES (NOW(), ?, ?, ?)
  `;
  db.query(sql1, [inventoryId, customerId, staffId], (err, result) => {
    if (err) return cb(err);
    const rentalId = result.insertId;

    // 2) bedrag ophalen van film
    const sql2 = `SELECT rental_rate FROM film WHERE film_id = ?`;
    db.query(sql2, [filmId], (e2, rows2) => {
      if (e2) return cb(e2);
      const amount = rows2?.[0]?.rental_rate || 0.00;

      // 3) payment registreren
      const sql3 = `
        INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
        VALUES (?, ?, ?, ?, NOW())
      `;
      db.query(sql3, [customerId, staffId, rentalId, amount], (e3) => {
        if (e3) return cb(e3);
        cb(null, rentalId);
      });
    });
  });
};

// Innemen
exports.returnRental = (rentalId, cb) => {
  const sql = `UPDATE rental SET return_date = NOW() WHERE rental_id = ? AND return_date IS NULL`;
  db.query(sql, [rentalId], (err, result) => {
    if (err) return cb(err);
    cb(null, result.affectedRows);
  });
};

// Actieve rentals voor 1 klant
exports.listActiveForCustomer = (customerId, cb) => {
  const sql = `
    SELECT r.rental_id, r.rental_date, f.film_id, f.title
    FROM rental r
    JOIN inventory i ON i.inventory_id = r.inventory_id
    JOIN film f      ON f.film_id = i.film_id
    WHERE r.customer_id = ? AND r.return_date IS NULL
    ORDER BY r.rental_date DESC
  `;
  db.query(sql, [customerId], (err, rows) => {
    if (err) return cb(err);
    cb(null, rows || []);
  });
};

// Alle actieve rentals, optioneel gefilterd op store
exports.listAllActive = (storeId, cb) => {
  const sql = `
    SELECT
      r.rental_id, r.rental_date,
      c.customer_id, c.first_name, c.last_name,
      f.film_id, f.title,
      i.store_id
    FROM rental r
    JOIN inventory i ON i.inventory_id = r.inventory_id
    JOIN film f      ON f.film_id = i.film_id
    JOIN customer c  ON c.customer_id = r.customer_id
    WHERE r.return_date IS NULL
      ${storeId ? 'AND i.store_id = ?' : ''}
    ORDER BY r.rental_date DESC
    LIMIT 300
  `;
  const params = storeId ? [Number(storeId)] : [];
  db.query(sql, params, (err, rows) => {
    if (err) return cb(err);
    cb(null, rows || []);
  });
};


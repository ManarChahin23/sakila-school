// dao/films.dao.js
const db = require('../config/db');

/**
 * Overzicht per film:
 * copies   = aantal inventory-items
 * out_now  = aantal nu uitgeleend (return_date IS NULL)
 * available= copies - out_now
 * Optioneel filter op store en/of titel (q).
 */
exports.getOverview = (storeId, q, cb) => {
  const where = [];
  const params = [];

  if (storeId) { where.push('i.store_id = ?'); params.push(Number(storeId)); }
  if (q)       { where.push('f.title LIKE ?'); params.push(`%${q}%`); }

  const sql = `
    SELECT f.film_id, f.title,
           COUNT(i.inventory_id) AS copies,
           SUM(CASE WHEN r.rental_id IS NOT NULL THEN 1 ELSE 0 END) AS out_now
    FROM film f
    JOIN inventory i ON i.film_id = f.film_id
    LEFT JOIN rental r
      ON r.inventory_id = i.inventory_id
     AND r.return_date IS NULL
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY f.film_id, f.title
    ORDER BY f.title
    LIMIT 300
  `;
  db.query(sql, params, (err, rows) => {
    if (err) return cb(err);
    const mapped = (rows || []).map(x => ({
      film_id: x.film_id,
      title: x.title,
      copies: Number(x.copies) || 0,
      out_now: Number(x.out_now) || 0,
      available: (Number(x.copies) || 0) - (Number(x.out_now) || 0),
    }));
    cb(null, mapped);
  });
};

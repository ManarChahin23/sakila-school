// routes/films.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/films/search?q=TEXT[&storeId=1|2]
 * Geeft max. 20 films terug met (optioneel) beschikbaarheid voor gekozen store.
 */
router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  const storeId = Number(req.query.storeId || 0); // 0 = geen store-filter

  if (!q) return res.json([]);

  const sql = `
    SELECT f.film_id, f.title,
           ${storeId ? `SUM(CASE WHEN r.rental_id IS NULL THEN 1 ELSE 0 END)` : 'NULL'} AS available
    FROM inventory i
    JOIN film f ON f.film_id = i.film_id
    LEFT JOIN rental r
      ON r.inventory_id = i.inventory_id
     AND r.return_date IS NULL
    WHERE f.title LIKE ?
      ${storeId ? 'AND i.store_id = ?' : ''}
    GROUP BY f.film_id, f.title
    ORDER BY f.title
    LIMIT 20
  `;
  const params = storeId ? [`%${q}%`, storeId] : [`%${q}%`];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('films.search error:', err);
      return res.status(500).json({ error: 'db' });
    }
    res.json(rows || []);
  });
});

module.exports = router;

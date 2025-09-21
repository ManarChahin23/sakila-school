// routes/films.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  const storeId = Number(req.query.storeId || 0);
  const limit  = Math.min(Number(req.query.limit) || 20, 100);
  const page   = Math.max(Number(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  if (!q) return res.json([]);

  const sql = `
    SELECT
      f.film_id,
      f.title
      ${storeId ? `,
      SUM(CASE WHEN r.rental_id IS NULL THEN 1 ELSE 0 END) AS available` : ``}
    FROM inventory i
    JOIN film f ON f.film_id = i.film_id
    LEFT JOIN rental r
      ON r.inventory_id = i.inventory_id
      AND r.return_date IS NULL
    WHERE f.title LIKE ?
    ${storeId ? 'AND i.store_id = ?' : ''}
    GROUP BY f.film_id, f.title
    ORDER BY f.title
    LIMIT ? OFFSET ?
  `;
  const params = storeId
    ? [`%${q}%`, storeId, limit, offset]
    : [`%${q}%`, limit, offset];

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db' });
    res.json(rows || []);
  });
});

module.exports = router;

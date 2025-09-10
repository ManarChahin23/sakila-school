const { pool } = require('../config/db');

function findAll(limit, cb) {
  pool.query(
    `SELECT film_id, title, release_year, rental_rate, rating FROM film LIMIT ?`,
    [limit],
    (err, rows) => cb(err, rows)
  );
}

function findById(id, cb) {
  pool.query(
    `SELECT f.film_id, f.title, f.description, f.release_year, l.name AS language
     FROM film f JOIN language l ON f.language_id = l.language_id
     WHERE f.film_id = ?`,
    [id],
    (err, rows) => cb(err, rows && rows[0])
  );
}

module.exports = { findAll, findById };

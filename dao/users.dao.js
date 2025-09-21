// dao/users.dao.js
const database = require('../config/db');
const logger = require('../util/logger');

const TABLE = 'customer';
const PK = 'customer_id';

const usersDao = {
  // Lijst + zoeken + sorteren + OFFSET/LIMIT
  list({ limit = 30, offset = 0, order = 'DESC', q = '' }, callback) {
    let sql = `
      SELECT customer_id, first_name, last_name, email
      FROM ${TABLE}
      WHERE active = 1
    `;
    const params = [];

    const text = String(q || '').trim();
    if (text) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const like = `%${text}%`;
      params.push(like, like, like);
    }

    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${PK} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(Number(limit) || 20, Number(offset) || 0);

    database.query(sql, params, (err, rows) => {
      if (err) return callback(err);
      return callback(undefined, rows);
    });
  },

  // Totaal (voor paginering)
  countAll(q = '', callback) {
    let sql = `SELECT COUNT(*) AS total FROM ${TABLE} WHERE active = 1`;
    const params = [];

    const text = String(q || '').trim();
    if (text) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const like = `%${text}%`;
      params.push(like, like, like);
    }

    database.query(sql, params, (err, rows) => {
      if (err) return callback(err);
      return callback(undefined, rows && rows[0] ? rows[0].total : 0);
    });
  },

  // Eén user halen (incl. adres/city indien aanwezig, read-only in UI)
  get(userId, callback) {
    const sql = `
      SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        a.address,
        a.address2,
        a.district,
        a.postal_code,
        a.phone,
        ci.city
      FROM customer c
      LEFT JOIN address a ON c.address_id = a.address_id
      LEFT JOIN city    ci ON a.city_id    = ci.city_id
      WHERE c.${PK} = ?
    `;
    database.query(sql, [userId], (err, rows) => {
      if (err) {
        logger.error('users.dao.get - query failed', { err, userId });
        return callback(err);
      }
      return callback(undefined, rows && rows[0]);
    });
  },

  // Alleen email bijwerken
  updateEmail(email, userId, callback) {
    const sql = `UPDATE ${TABLE} SET email = ? WHERE ${PK} = ?`;
    database.query(sql, [email, userId], (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Meerdere velden (first_name, last_name, email)
  update(data, userId, callback) {
    const allowed = ['first_name', 'last_name', 'email'];
    const sets = [];
    const params = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sets.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (!sets.length) return callback(undefined, 0);

    const sql = `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE ${PK} = ?`;
    params.push(userId);

    database.query(sql, params, (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Soft delete / restore
  delete(userId, callback) {
    const sql = `UPDATE ${TABLE} SET active = 0 WHERE ${PK} = ?`;
    database.query(sql, [userId], (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  restore(userId, callback) {
    const sql = `UPDATE ${TABLE} SET active = 1 WHERE ${PK} = ?`;
    database.query(sql, [userId], (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Create zonder adres (address_id=1 om constraints te voldoen)
  create(user, cb) {
    const sql = `
      INSERT INTO customer (store_id, first_name, last_name, email, address_id, active)
      VALUES (1, ?, ?, ?, 1, 1)
    `;
    const params = [user.first_name, user.last_name, user.email || null];

    database.query(sql, params, (err, result) => {
      if (err) return cb(err);
      return cb(null, result.insertId);
    });
  }
};

module.exports = usersDao;

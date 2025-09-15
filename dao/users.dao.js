// dao/users.dao.js
const database = require('../config/db');
const logger = require('../util/logger');

const iTable = 'customer';
const PK = 'customer_id';

const usersDao = {
list({ limit = 30, order = 'DESC', q = '' }, callback) {
  let sql = 'SELECT ??, ??, ??, ?? FROM ?? WHERE ?? = 1';
  const params = [
    'customer_id',
    'first_name',
    'last_name',
    'email',
    iTable,      // 'customer'
    'active'
  ];

   const text = String(q || '').trim(); 
  if (text) {
    sql += ' AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ?)';
    const like = `%${text}%`;
    params.push('first_name', like, 'last_name', like, 'email', like);
  }

  sql += ` ORDER BY ?? ${order === 'ASC' ? 'ASC' : 'DESC'} LIMIT ?`;
  params.push(PK, Number(limit) || 20);

  database.query(sql, params, (err, rows) => {
    if (err) return callback(err);
    return callback(undefined, rows);
  });
},


  // Eén user ophalen (incl. adres + stad)
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
      JOIN address a ON c.address_id = a.address_id
      JOIN city    ci ON a.city_id    = ci.city_id
      WHERE c.customer_id = ?`;
    const params = [userId];

    database.query(sql, params, (err, rows) => {
      if (err) {
        logger.error('users.dao.get - query failed', { err, userId });
        return callback(err, undefined);
      }
      const user = rows && rows[0];
      logger.info('users.dao.get - success', { userId, found: !!user });
      return callback(undefined, user);
    });
  },

  // Alleen email bijwerken
  updateEmail(email, userId, callback) {
    const sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
    const params = [iTable, 'email', email, PK, userId];

    database.query(sql, params, (err, result) => {
      if (err) {
        logger.error('users.dao.updateEmail - query failed', { err, userId });
        return callback(err);
      }
      return callback(undefined, result.affectedRows);
    });
  },

  // Meerdere velden bijwerken (first_name, last_name, email)
  update(data, userId, callback) {
    const allowed = ['first_name', 'last_name', 'email'];
    const sets = [];
    const params = [iTable];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sets.push('?? = ?');
        params.push(key, data[key]);
      }
    }

    if (!sets.length) {
      logger.warn('users.dao.update - no fields provided', { userId });
      return callback(undefined, 0);
    }

    const sql = `UPDATE ?? SET ${sets.join(', ')} WHERE ?? = ?`;
    params.push(PK, userId);

    database.query(sql, params, (err, result) => {
      if (err) {
        logger.error('users.dao.update - query failed', { err, userId, fields: Object.keys(data) });
        return callback(err);
      }
      return callback(undefined, result.affectedRows);
    });
  },

  // Deactiveren (soft delete)
  delete(userId, callback) {
    const sql = 'UPDATE ?? SET ?? = 0 WHERE ?? = ?';
    const params = [iTable, 'active', PK, userId];
    database.query(sql, params, (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Herstellen
  restore(userId, callback) {
    const sql = 'UPDATE ?? SET ?? = 1 WHERE ?? = ?';
    const params = [iTable, 'active', PK, userId];
    database.query(sql, params, (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Create
  create(user, cb) {
    const sql = `
      INSERT INTO customer (store_id, first_name, last_name, email, address_id, active)
      VALUES (1, ?, ?, ?, 1, 1)
    `;
    const params = [user.first_name, user.last_name, user.email || null];

    database.query(sql, params, (err, result) => {
      if (err) return cb(err);
      return cb(null, result.insertId); // nieuwe customer_id
    });
  }
};

module.exports = usersDao;

const database = require('../config/db');

const TABLE = 'customer';
const PK = 'customer_id';

const usersDao = {
  // Lijst voor /users
  list(limit = 20, callback) {
    const sql = 'SELECT ??, ??, ??, ?? FROM ?? ORDER BY ?? LIMIT ?';
    const params = ['customer_id', 'first_name', 'last_name', 'email', TABLE, PK, Number(limit) || 20];

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
      if (err) return callback(err, undefined);
      return callback(undefined, rows && rows[0]);
    });
  },

  // Alleen email bijwerken (les-stijl)
  updateEmail(email, userId, callback) {
    const sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
    const params = [TABLE, 'email', email, PK, userId];

    database.query(sql, params, (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Meerdere velden bijwerken (first_name, last_name, email) – dynamisch
  update(data, userId, callback) {
    const allowed = ['first_name', 'last_name', 'email'];
    const sets = [];
    const params = [TABLE];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sets.push('?? = ?');
        params.push(key, data[key]);
      }
    }

    if (!sets.length) return callback(undefined, 0); // niets te doen

    const sql = `UPDATE ?? SET ${sets.join(', ')} WHERE ?? = ?`;
    params.push(PK, userId);

    database.query(sql, params, (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },

  // Verwijderen
  delete(userId, callback) {
    const sql = 'DELETE FROM ?? WHERE ?? = ?';
    const params = [TABLE, PK, userId];

    database.query(sql, params, (err, result) => {
      if (err) return callback(err);
      return callback(undefined, result.affectedRows);
    });
  },
};

module.exports = usersDao;

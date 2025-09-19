// services/films.service.js
const dao = require('../dao/films.dao');

exports.getOverview = (storeId, q, cb) => {
  const sid = storeId ? Number(storeId) : null;
  const query = (q || '').trim();
  dao.getOverview(sid, query, cb);
};

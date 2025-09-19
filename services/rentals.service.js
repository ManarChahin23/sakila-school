// services/rentals.service.js
const dao = require('../dao/rentals.dao');

// Maak rental: zoekt eerst vrije inventory_id, maakt daarna rental + payment
// signature: create(customerId, filmId, storeId, staffId, cb)
exports.create = (customerId, filmId, storeId, staffId, cb) => {
  const c = Number(customerId), f = Number(filmId), s = Number(storeId);
  const st = Number(staffId);
  if (!c || !f || !s || !st) return cb(new Error('VALIDATION'));

  // Stap 1: vrije inventory zoeken
  dao.findAvailableInventoryId(f, s, (err, inventoryId) => {
    if (err) return cb(err);
    if (!inventoryId) return cb(new Error('NO_INVENTORY'));

    // Stap 2: rental + payment aanmaken
    dao.createRental({ customerId: c, filmId: f, inventoryId, staffId: st }, cb);
  });
};

exports.returnRental = (rentalId, cb) => {
  const id = Number(rentalId);
  if (!id) return cb(new Error('VALIDATION'));
  dao.returnRental(id, cb);
};

exports.listActiveForCustomer = (customerId, cb) => {
  const id = Number(customerId);
  if (!id) return cb(null, []);
  dao.listActiveForCustomer(id, cb);
};

exports.listAllActive = (storeId, cb) => {
  const sid = storeId ? Number(storeId) : null;
  const daoRef = require('../dao/rentals.dao');
  daoRef.listAllActive(sid, cb);
};


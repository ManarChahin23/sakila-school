// services/users.service.js
const dao = require('../dao/users.dao');
const logger = require('../util/logger');

exports.list = function list({ limit = 20, offset = 0, order = 'DESC', q = '' }, cb) {
  dao.list({ limit, offset, order, q }, (err, rows) => {
    if (err) return cb(err);
    return cb(undefined, rows);
  });
};

exports.countAll = (q = '', cb) => {
  dao.countAll(q, (err, total) => {
    if (err) return cb(err);
    return cb(undefined, total);
  });
};

exports.getById = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));
  dao.get(userId, (err, user) => {
    if (err) return cb(err);
    if (!user) return cb(new Error('NOT_FOUND'));
    return cb(undefined, user);
  });
};

exports.updateEmail = (id, email, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));
  const value = String(email || '').trim();
  if (!value) return cb(new Error('VALIDATION_EMAIL'));
  dao.updateEmail(value, userId, (err, affected) => {
    if (err) return cb(err);
    if (!affected) return cb(new Error('NOT_FOUND'));
    return cb(undefined, affected);
  });
};

exports.update = (id, dto, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  const data = {};
  if (dto.first_name !== undefined) data.first_name = String(dto.first_name).trim();
  if (dto.last_name  !== undefined) data.last_name  = String(dto.last_name).trim();
  if (dto.email      !== undefined) data.email      = String(dto.email).trim();

  if ('first_name' in data && !data.first_name) return cb(new Error('VALIDATION_FIRST'));
  if ('last_name'  in data && !data.last_name)  return cb(new Error('VALIDATION_LAST'));
  if (Object.keys(data).length === 0)           return cb(new Error('NO_FIELDS'));

  dao.update(data, userId, (err, affected) => {
    if (err) return cb(err);
    if (!affected) return cb(new Error('NOT_FOUND'));
    return cb(undefined, affected);
  });
};

exports.remove = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));
  dao.delete(userId, (err, affected) => {
    if (err) return cb(err);
    if (!affected) return cb(new Error('NOT_FOUND'));
    return cb(undefined, affected);
  });
};

exports.restore = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));
  dao.restore(userId, (err, affected) => {
    if (err) return cb(err);
    if (!affected) return cb(new Error('NOT_FOUND'));
    return cb(undefined, affected);
  });
};

exports.create = (payload, cb) => {
  const first = (payload.first_name || '').trim();
  const last  = (payload.last_name  || '').trim();
  const email = (payload.email      || '').trim();

  if (!first) return cb(new Error('VALIDATION_FIRST'));
  if (!last)  return cb(new Error('VALIDATION_LAST'));

  dao.create({ first_name: first, last_name: last, email }, (err, newId) => {
    if (err) return cb(err);
    return cb(null, newId);
  });
};

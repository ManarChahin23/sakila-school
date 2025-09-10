// services/users.service.js
const dao = require('../dao/users.dao');
const logger = require('../util/logger');

// Lijst met users
exports.list = (params, cb) => {
  const limit = Number(params?.limit) || 20;
  dao.list(limit, (err, rows) => {
    if (err) {
      logger.error('users.service.list - DAO error', { err });
      return cb(err);
    }
    logger.info(`users.service.list - returned ${rows.length} users`);
    return cb(undefined, rows);
  });
};

// Eén user ophalen
exports.getById = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  dao.get(userId, (err, user) => {
    if (err) {
      logger.error('users.service.getById - DAO error', { err, userId });
      return cb(err);
    }
    if (!user) {
      logger.warn('users.service.getById - NOT_FOUND', { userId });
      return cb(new Error('NOT_FOUND'));
    }
    return cb(undefined, user);
  });
};

// Alleen email bijwerken
exports.updateEmail = (id, email, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  const value = String(email || '').trim();
  if (!value) return cb(new Error('VALIDATION_EMAIL'));

  dao.updateEmail(value, userId, (err, affected) => {
    if (err) {
      logger.error('users.service.updateEmail - DAO error', { err, userId });
      return cb(err);
    }
    if (!affected) return cb(new Error('NOT_FOUND'));
    logger.info('users.service.updateEmail - updated', { userId, affected });
    return cb(undefined, affected);
  });
};

// Meerdere velden bijwerken (first_name, last_name, email)
exports.update = (id, dto, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  const data = {};
  if (dto.first_name !== undefined) data.first_name = String(dto.first_name).trim();
  if (dto.last_name  !== undefined) data.last_name  = String(dto.last_name).trim();
  if (dto.email      !== undefined) data.email      = String(dto.email).trim();

  // simpele validatie
  if ('first_name' in data && !data.first_name) return cb(new Error('VALIDATION_FIRST'));
  if ('last_name'  in data && !data.last_name)  return cb(new Error('VALIDATION_LAST'));
  if (Object.keys(data).length === 0)           return cb(new Error('NO_FIELDS'));

  dao.update(data, userId, (err, affected) => {
    if (err) {
      logger.error('users.service.update - DAO error', { err, userId, data });
      return cb(err);
    }
    if (!affected) return cb(new Error('NOT_FOUND'));
    logger.info('users.service.update - updated', { userId, affected });
    return cb(undefined, affected);
  });
};

// Verwijderen
exports.remove = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  dao.delete(userId, (err, affected) => {
    if (err) {
      logger.error('users.service.remove - DAO error', { err, userId });
      return cb(err);
    }
    if (!affected) return cb(new Error('NOT_FOUND'));
    logger.info('users.service.remove - deleted', { userId, affected });
    return cb(undefined, affected);
  });
};

// Herstellen (soft-undelete)
exports.restore = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  dao.restore(userId, (err, affected) => {
    if (err) {
      logger.error('users.service.restore - DAO error', { err, userId });
      return cb(err);
    }
    if (!affected) return cb(new Error('NOT_FOUND'));
    logger.info('users.service.restore - restored', { userId, affected });
    return cb(undefined, affected);
  });
};

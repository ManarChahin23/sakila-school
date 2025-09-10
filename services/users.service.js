const dao = require('../dao/users.dao');

exports.list = (params, cb) => {
  const limit = Number(params?.limit) || 20;
  dao.list(limit, cb);
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

// Alleen email bijwerken
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
    if (err) return cb(err);
    if (!affected) return cb(new Error('NOT_FOUND'));
    return cb(undefined, affected);
  });
};

// Verwijderen
exports.remove = (id, cb) => {
  const userId = Number(id);
  if (!userId) return cb(new Error('BAD_REQUEST'));

  dao.delete(userId, (err, affected) => {
    if (err) return cb(err);
    if (!affected) return cb(new Error('NOT_FOUND'));
    return cb(undefined, affected);
  });
};

// tests/films.service.test.js
jest.mock('../dao/films.dao', () => ({ getOverview: jest.fn() }));
const dao = require('../dao/films.dao');
const svc = require('../services/films.service');

describe('films.service.getOverview', () => {
  afterEach(() => jest.clearAllMocks());

  it('trims query and forwards to dao once', (done) => {
    dao.getOverview.mockImplementation((_sid, _q, cb) => cb(null, [{ film_id: 7 }]));

    // let op: jouw service signature: (storeId, q, cb)
    svc.getOverview('1', '  ace  ', (err, rows) => {
      expect(err).toBeNull();
      expect(rows).toEqual([{ film_id: 7 }]);
      expect(dao.getOverview).toHaveBeenCalledTimes(1);

      const [sidArg, qArg] = dao.getOverview.mock.calls[0];
      expect(sidArg).toBe(1);         // Number(...) van '1'
      expect(qArg).toBe('ace');       // trim()
      done();
    });
  });
});

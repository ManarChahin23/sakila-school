// tests/films.route.test.js
jest.mock('../config/db', () => ({
  query: (sql, params, cb) => {
    // Simuleer zoekresultaat
    cb(null, [
      { film_id: 1, title: 'ACE GOLDFINGER' },
      { film_id: 2, title: 'ACE HIGH' }
    ]);
  }
}));

const request = require('supertest');
const app = require('../app');

describe('GET /api/films/search', () => {
  it('returns films list (mocked DB)', async () => {
    const res = await request(app).get('/api/films/search?q=ACE');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('film_id');
    expect(res.body[0]).toHaveProperty('title');
    // optioneel: exact match
    expect(res.body).toEqual([
      { film_id: 1, title: 'ACE GOLDFINGER' },
      { film_id: 2, title: 'ACE HIGH' }
    ]);
  });
});

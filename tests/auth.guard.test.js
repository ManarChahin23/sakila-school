// tests/auth.guard.test.js
describe('Auth guard on /users', () => {
  test('redirects to /auth/login when not logged in', async () => {
    const request = require('supertest');
    const app = require('../app');

    const res = await request(app).get('/users').redirects(0);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect((res.headers.location || '')).toMatch(/\/auth\/login/);
  });

  test('allows access when isLoggedIn passes (mocked), returns 200', async () => {
    jest.resetModules(); // nieuwe module graph

    // ✅ Mock de volledige auth.controller die routes/auth.js verwacht
    jest.doMock('../controllers/auth.controller', () => ({
      isLoggedIn: (_req, _res, next) => next(),
      requireRole: (_role) => (_req, _res, next) => next(), // <— belangrijk
      showLogin: (_req, res) => res.status(200).send('login page'),
      login: (_req, res) => res.redirect('/'),
      logout: (_req, res) => res.redirect('/auth/login'),
      showRegister: (_req, res) => res.status(200).send('register page'),
      register: (_req, res) => res.redirect('/users')
    }));

    // Mock de users-router zodat we geen DB nodig hebben
    jest.doMock('../routes/users', () => {
      const express = require('express');
      const r = express.Router();
      r.get('/', (_req, res) => res.status(200).send('users ok'));
      return r;
    });

    const request = require('supertest');
    const app = require('../app'); // NA de mocks importeren

    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.text).toBe('users ok');
  });
});

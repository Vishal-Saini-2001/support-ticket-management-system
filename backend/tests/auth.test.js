const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a user with role "user" even if role "admin" is sent in body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Tester',
          email: 'alice@example.com',
          password: 'Password123!',
          role: 'admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        name: 'Alice Tester',
        email: 'alice@example.com',
        role: 'user',
      });
      expect(res.body.user.password).toBeUndefined();

      const userInDb = await User.findOne({ email: 'alice@example.com' });
      expect(userInDb.role).toBe('user');
    });

    it('rejects duplicate email registration with 409', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Clone',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBeDefined();
    });

    it('validates input and returns { message, errors } on 400', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'A',
        email: 'not-an-email',
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/auth/login & GET /api/auth/me', () => {
    it('logs in a registered user and retrieves profile via /api/auth/me', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Bob User',
        email: 'bob@example.com',
        password: 'Secret123!',
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'bob@example.com',
        password: 'Secret123!',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.token).toBeDefined();

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('bob@example.com');
      expect(meRes.body.user.role).toBe('user');
    });

    it('returns 401 for wrong password and missing token', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Bob User',
        email: 'bob@example.com',
        password: 'Secret123!',
      });

      const badLogin = await request(app).post('/api/auth/login').send({
        email: 'bob@example.com',
        password: 'WrongPassword',
      });
      expect(badLogin.status).toBe(401);

      const unauthMe = await request(app).get('/api/auth/me');
      expect(unauthMe.status).toBe(401);
    });

    it('allows login with .local admin email and revokes JWT on logout', async () => {
      await User.create({
        name: 'System Admin',
        email: 'admin@support.local',
        password: 'Admin@123456',
        role: 'admin',
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@support.local',
        password: 'Admin@123456',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.role).toBe('admin');
      const { token } = loginRes.body;

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe('Logged out successfully');

      const afterLogoutMe = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(afterLogoutMe.status).toBe(401);
    });
  });
});


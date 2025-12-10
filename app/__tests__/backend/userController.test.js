const request = require('supertest');
const app = require('../../server');

describe('User Controller Tests', () => {
  // Test 1: Register without required fields
  describe('POST /api/users/register', () => {
    it('should return 400 when registering without required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({});
      
      expect(response.status).toBe(400);
    });

    // Test 2: Valid registration
    it('should return 200 for valid registration', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123'
        });
      
      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('userId');
    });
  });

  // Test 3: Login without credentials
  describe('POST /api/users/login', () => {
    it('should return 400 when logging in without credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({});
      
      expect(response.status).toBe(400);
    });

    // Test 4: Login with credentials
    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  // Test 5: Logout
  describe('POST /api/users/logout', () => {
    it('should return 200 for logout', async () => {
      const response = await request(app)
        .post('/api/users/logout')
        .send();
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out');
    });
  });
});

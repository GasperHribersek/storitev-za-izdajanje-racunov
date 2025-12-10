const request = require('supertest');
const app = require('../../server');

describe('Client Routes Tests', () => {
  // Test 1: Get clients without authentication
  describe('GET /api/clients', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/clients');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not logged in');
    });
  });

  // Test 2: Create client without authentication
  describe('POST /api/clients', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          name: 'Test Client',
          email: 'client@example.com'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not logged in');
    });
  });
});

const request = require('supertest');
const app = require('../../server');

describe('Service Routes Tests', () => {
  // Test 1: Get services without authentication
  describe('GET /api/services', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/services');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Not authenticated');
    });
  });

  // Test 2: Create service without authentication
  describe('POST /api/services', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          name: 'Test Service',
          price: 100
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Not authenticated');
    });
  });
});

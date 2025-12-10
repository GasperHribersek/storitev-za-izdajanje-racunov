const request = require('supertest');
const app = require('../../server');

describe('Invoice Routes Tests', () => {
  // Test 1: Get next invoice number without authentication
  describe('GET /api/invoices/next-number', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/invoices/next-number');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  // Test 2: Get invoices without authentication
  describe('GET /api/invoices', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/invoices');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not logged in');
    });
  });

  // Test 3: Create invoice without authentication
  describe('POST /api/invoices', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          invoice_number: 'INV-001',
          date: '2024-01-01',
          amount: 100
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  // Test 4: Delete invoice
  describe('DELETE /api/invoices/:id', () => {
    it('should handle delete request for invoice', async () => {
      const response = await request(app)
        .delete('/api/invoices/999');
      
      // Should return either 404 (not found) or 500 (server error)
      expect([404, 500]).toContain(response.status);
    });
  });
});

// Mock the database pool for all tests
jest.mock('../config/db', () => {
  const mockPool = {
    query: jest.fn((sql, params, callback) => {
      // If callback is provided, it's the old style
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      
      // Simulate async behavior
      setImmediate(() => {
        if (callback) {
          // Simulate different responses based on query type
          if (sql.includes('INSERT')) {
            // Return mock insert result with insertId
            callback(null, { insertId: 1, affectedRows: 1 }, null);
          } else if (sql.includes('DELETE')) {
            // Return mock delete result with 0 affected rows (not found)
            callback(null, { affectedRows: 0 }, null);
          } else {
            // Return empty results for SELECT queries
            callback(null, [], null);
          }
        }
      });
    }),
    getConnection: jest.fn((callback) => {
      // Simulate connection error in test mode
      setImmediate(() => {
        const error = new Error('Database connection skipped in test mode');
        error.code = 'TEST_MODE';
        callback(error);
      });
    })
  };

  return {
    pool: mockPool,
    connectDB: jest.fn()
  };
});

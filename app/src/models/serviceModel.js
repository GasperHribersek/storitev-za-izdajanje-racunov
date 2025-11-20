const { pool } = require('../../config/db');

// Get all services for a user
function getServicesByUser(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC';
    pool.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
}

// Get a single service by ID
function getServiceById(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM services WHERE id = ? AND user_id = ?';
    pool.query(sql, [id, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results && results.length > 0 ? results[0] : null);
    });
  });
}

// Create a new service
function createService(payload) {
  return new Promise((resolve, reject) => {
    const { user_id, name, description, amount, category } = payload;
    const sql = 'INSERT INTO services (user_id, name, description, amount, category) VALUES (?, ?, ?, ?, ?)';
    pool.query(sql, [user_id, name, description, amount || 0, category], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

// Update a service
function updateService(id, userId, payload) {
  return new Promise((resolve, reject) => {
    const { name, description, amount, category } = payload;
    const sql = 'UPDATE services SET name = ?, description = ?, amount = ?, category = ? WHERE id = ? AND user_id = ?';
    pool.query(sql, [name, description, amount || 0, category, id, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
}

// Delete a service
function deleteService(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM services WHERE id = ? AND user_id = ?';
    pool.query(sql, [id, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
}

module.exports = {
  getServicesByUser,
  getServiceById,
  createService,
  updateService,
  deleteService
};

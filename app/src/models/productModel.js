const { pool } = require('../../config/db');

// Get all products for a user
function getProductsByUser(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC';
    pool.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
}

// Get a single product by ID
function getProductById(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM products WHERE id = ? AND user_id = ?';
    pool.query(sql, [id, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results && results.length > 0 ? results[0] : null);
    });
  });
}

// Create a new product
function createProduct(payload) {
  return new Promise((resolve, reject) => {
    const { user_id, name, description, price, category } = payload;
    const sql = 'INSERT INTO products (user_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)';
    pool.query(sql, [user_id, name, description, price || 0, category], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

// Update a product
function updateProduct(id, userId, payload) {
  return new Promise((resolve, reject) => {
    const { name, description, price, category } = payload;
    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ? AND user_id = ?';
    pool.query(sql, [name, description, price || 0, category, id, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
}

// Delete a product
function deleteProduct(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM products WHERE id = ? AND user_id = ?';
    pool.query(sql, [id, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
}

module.exports = {
  getProductsByUser,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

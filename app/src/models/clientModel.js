const { pool } = require('../../config/db');

// Get all clients for a user
function getClientsByUser(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC';
    pool.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Get a single client by id
function getClientById(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM clients WHERE id = ? AND user_id = ?';
    pool.query(sql, [id, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

// Create a new client
function createClient({ user_id, name, email, phone, address, tax_id }) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO clients (user_id, name, email, phone, address, tax_id) VALUES (?, ?, ?, ?, ?, ?)';
    pool.query(sql, [user_id, name, email, phone, address, tax_id], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
}

// Update a client
function updateClient({ id, name, email, phone, address, tax_id }) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, tax_id = ? WHERE id = ?';
    pool.query(sql, [name, email, phone, address, tax_id, id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
}

// Delete a client
function deleteClient(id) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM clients WHERE id = ?';
    pool.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
}

module.exports = {
  getClientsByUser,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};

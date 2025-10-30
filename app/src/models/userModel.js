const { pool } = require('../../config/db');

function findByEmail(email) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function create({ name, email, password }) {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [name, email, password], (err, results) => {
      if (err) return reject(err);
      resolve(results.insertId);
    });
  });
}

module.exports = { findByEmail, create };

const pool = require('../../config/db');

function getInvoicesByUser(userId) {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM invoices WHERE user_id = ? ORDER BY date DESC',
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

function createInvoice({ user_id, invoice_number, date, amount, description }) {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO invoices (user_id, invoice_number, date, amount, description) VALUES (?, ?, ?, ?, ?)',
      [user_id, invoice_number, date, amount, description],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.insertId);
      }
    );
  });
}

module.exports = { getInvoicesByUser, createInvoice };

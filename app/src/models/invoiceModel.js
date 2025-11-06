const { pool } = require('../../config/db');

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

function createInvoice({ user_id, invoice_number, date, due_date, client_name, amount, description, status }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO invoices (user_id, invoice_number, date, due_date, client_name, amount, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [user_id, invoice_number, date, due_date || null, client_name || null, amount, description || null, status || 'draft'];
    console.log('invoiceModel.createInvoice sql=', sql, 'params=', params);
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results.insertId);
    });
  });
}

function deleteInvoice(id) {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM invoices WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results.affectedRows);
    });
  });
}

function updateInvoice({ id, invoice_number, date, amount, description, due_date, status }) {
  return new Promise((resolve, reject) => {
    // Update including optional due_date and status. The database may not have these
    // columns on older installations; ensure the DB schema is migrated before calling
    // with these fields. Values are allowed to be null.
    const sql = `UPDATE invoices SET invoice_number = ?, date = ?, amount = ?, description = ?, due_date = ?, status = ? WHERE id = ?`;
    pool.query(sql, [invoice_number, date, amount, description, due_date || null, status || null, id], (err, results) => {
      if (err) return reject(err);
      resolve(results.affectedRows);
    });
  });
}

module.exports = { getInvoicesByUser, createInvoice, deleteInvoice, updateInvoice };

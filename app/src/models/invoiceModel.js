const { pool } = require('../../config/db');

function getNextInvoiceNumber(userId) {
  return new Promise((resolve, reject) => {
    // Try to get existing sequence
    pool.query(
      'SELECT next_number FROM invoice_sequences WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) return reject(err);
        
        console.log('invoiceModel.getNextInvoiceNumber userId=', userId, 'results=', results);
        
        if (results.length > 0) {
          // Sequence exists, increment it
          const nextNum = results[0].next_number;
          console.log('Found existing sequence, nextNum=', nextNum);
          pool.query(
            'UPDATE invoice_sequences SET next_number = next_number + 1 WHERE user_id = ?',
            [userId],
            (err) => {
              if (err) return reject(err);
              console.log('Updated sequence, returning', nextNum);
              resolve(`${nextNum}`);
            }
          );
        } else {
          // Create new sequence starting at 1
          console.log('Creating new sequence for userId=', userId);
          pool.query(
            'INSERT INTO invoice_sequences (user_id, next_number) VALUES (?, 2)',
            [userId],
            (err) => {
              if (err) return reject(err);
              console.log('Created new sequence, returning 1');
              resolve('1');
            }
          );
        }
      }
    );
  });
}

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

module.exports = { getNextInvoiceNumber, getInvoicesByUser, createInvoice, deleteInvoice, updateInvoice };

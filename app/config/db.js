const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

function connectDB() {
  pool.getConnection((err, conn) => {
    if (err) throw err;
    console.log('✅ MySQL Connected');
    // Ensure invoices table exists (safe to run on startup)
    const createInvoices = `
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        invoice_number VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        due_date DATE DEFAULT NULL,
        amount DECIMAL(12,2) DEFAULT 0.00,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    conn.query(createInvoices, (err) => {
      if (err) console.error('Error ensuring invoices table exists:', err);
      conn.release();
    });
  });
}

module.exports = { pool, connectDB };

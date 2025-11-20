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
    
    // Ensure invoices table exists with all columns
    const createInvoices = `
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        invoice_number VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        due_date DATE DEFAULT NULL,
        client_name VARCHAR(255) DEFAULT NULL,
        amount DECIMAL(12,2) DEFAULT 0.00,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Ensure invoice_sequences table exists
    const createSequences = `
      CREATE TABLE IF NOT EXISTS invoice_sequences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        next_number INT DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Ensure services table exists
    const createServices = `
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(12,2) DEFAULT 0.00,
        category VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Ensure products table exists
    const createProducts = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) DEFAULT 0.00,
        category VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Ensure clients table exists
    const createClients = `
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        tax_id VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    
    conn.query(createInvoices, (err) => {
      if (err) console.error('Error ensuring invoices table exists:', err);
      
      conn.query(createSequences, (err) => {
        if (err) console.error('Error ensuring invoice_sequences table exists:', err);
        
        conn.query(createServices, (err) => {
          if (err) console.error('Error ensuring services table exists:', err);
          
          conn.query(createProducts, (err) => {
            if (err) console.error('Error ensuring products table exists:', err);
            
            conn.query(createClients, (err) => {
              if (err) console.error('Error ensuring clients table exists:', err);
              conn.release();
            });
          });
        });
      });
    });
  });
}

module.exports = { pool, connectDB };

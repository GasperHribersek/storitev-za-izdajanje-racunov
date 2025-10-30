const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');  // <-- import
const { connectDB } = require('./config/db');
const userRoutes = require('./src/routes/userRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'views')));

// --- SESSION CONFIG ---
app.use(session({
  secret: 'your_secret_key',  // change this to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));


// Simple test route to check session
app.get('/dashboard', (req, res) => {
  if (req.session.userId) {
    res.send(`Logged in as user ID: ${req.session.userId}`);
  } else {
    res.send('Not logged in');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

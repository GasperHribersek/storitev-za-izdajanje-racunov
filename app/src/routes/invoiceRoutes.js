const express = require('express');
const router = express.Router();
const { getInvoicesByUser } = require('../controllers/invoiceController');

// GET invoices for logged-in user
router.get('/', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  getInvoicesByUser(req.session.userId)
    .then(invoices => res.json(invoices))
    .catch(err => res.status(500).json({ message: 'Server error', error: err }));
});

module.exports = router;

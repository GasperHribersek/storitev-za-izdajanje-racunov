const express = require('express');
const router = express.Router();
const { getNextInvoiceNumber, getInvoicesByUser, createInvoice, deleteInvoice, updateInvoice } = require('../controllers/invoiceControllers');
const { generateInvoicePDF, generateInvoiceCSV } = require('../controllers/pdfController');

// GET next invoice number for logged-in user
router.get('/next-number', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  console.log('GET /api/invoices/next-number userId=', req.session.userId);
  getNextInvoiceNumber(req.session.userId)
    .then(nextNumber => {
      console.log('Returning nextNumber=', nextNumber);
      res.json({ nextNumber });
    })
    .catch(err => {
      console.error('Error getting next invoice number:', err);
      res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : err });
    });
});

// GET invoices for logged-in user
router.get('/', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  getInvoicesByUser(req.session.userId)
    .then(invoices => res.json(invoices))
    .catch(err => res.status(500).json({ message: 'Server error', error: err }));
});

// POST create a new invoice
router.post('/', (req, res) => {
  // allow providing user_id in body as a fallback for development/testing
  const userId = req.session && req.session.userId ? req.session.userId : req.body.user_id;
  if (!userId) return res.status(401).json({ message: 'Not logged in - please login or provide user_id in request body (dev only)' });
  console.log('POST /api/invoices body=', req.body, 'userId=', userId);
  // Accept client_name and due_date from the form; if date is missing default to today
  const { invoice_number, date, amount, description, due_date, client_name, client, status } = req.body;
  const clientName = client_name || client || null;
  const useDate = date || new Date().toISOString().slice(0,10);
  // Basic validation
  if (!invoice_number || useDate == null || amount == null) return res.status(400).json({ message: 'Missing fields' });
  const payload = { user_id: userId, invoice_number, date: useDate, due_date, client_name: clientName, amount, description, status };
  console.log('Creating invoice with payload=', payload);
  createInvoice(payload)
    .then(id => {
      console.log('Invoice created id=', id, 'for user=', userId);
      res.status(201).json({ message: 'Created', id });
    })
    .catch(err => {
      console.error('Error creating invoice:', err);
      res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : err });
    });
});

// DELETE invoice
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  // Optionally check session/user ownership in production
  deleteInvoice(id)
    .then(affected => {
      if (affected === 0) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    })
    .catch(err => {
      console.error('Error deleting invoice:', err);
      res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : err });
    });
});

// PUT update invoice
router.put('/:id', (req, res) => {
  const id = req.params.id;
  console.log('PUT /api/invoices/' + id + ' body=', req.body);
  const { invoice_number, date, amount, description, due_date, status } = req.body;
  // basic validation
  if (!invoice_number || !date || amount == null) return res.status(400).json({ message: 'Missing fields' });
  updateInvoice({ id, invoice_number, date, amount, description, due_date, status })
    .then(affected => {
      if (affected === 0) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Updated' });
    })
    .catch(err => {
      console.error('Error updating invoice:', err);
      res.status(500).json({ message: 'Server error', error: err && err.message ? err.message : err });
    });
});

// GET download invoice as PDF
router.get('/:id/pdf', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  const id = req.params.id;
  console.log('GET /api/invoices/' + id + '/pdf for user', req.session.userId);
  generateInvoicePDF(id, res);
});

// GET download invoice as CSV
router.get('/:id/csv', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  const id = req.params.id;
  console.log('GET /api/invoices/' + id + '/csv for user', req.session.userId);
  generateInvoiceCSV(id, res);
});

module.exports = router;

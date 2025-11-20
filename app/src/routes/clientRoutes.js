const express = require('express');
const router = express.Router();
const { getAllClients, getClient, addClient, editClient, removeClient } = require('../controllers/clientController');

// All routes require authentication
router.use((req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });
  next();
});

// GET all clients for logged-in user
router.get('/', getAllClients);

// GET single client
router.get('/:id', getClient);

// POST create new client
router.post('/', addClient);

// PUT update client
router.put('/:id', editClient);

// DELETE client
router.delete('/:id', removeClient);

module.exports = router;

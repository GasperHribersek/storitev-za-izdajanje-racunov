const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getService,
  addService,
  editService,
  removeService
} = require('../controllers/serviceController');

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// GET all services for the current user
router.get('/', checkAuth, getAllServices);

// GET single service
router.get('/:id', checkAuth, getService);

// POST create new service
router.post('/', checkAuth, addService);

// PUT update service
router.put('/:id', checkAuth, editService);

// DELETE service
router.delete('/:id', checkAuth, removeService);

module.exports = router;

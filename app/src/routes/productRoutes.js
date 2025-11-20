const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct
} = require('../controllers/productController');

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// GET all products for the current user
router.get('/', checkAuth, getAllProducts);

// GET single product
router.get('/:id', checkAuth, getProduct);

// POST create new product
router.post('/', checkAuth, addProduct);

// PUT update product
router.put('/:id', checkAuth, editProduct);

// DELETE product
router.delete('/:id', checkAuth, removeProduct);

module.exports = router;

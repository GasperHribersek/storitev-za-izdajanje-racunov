const {
  getProductsByUser,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../models/productModel');

// Express middleware functions for route handlers
const getAllProducts = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log('GET all products for user=', userId);
    const products = await getProductsByUser(userId);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    console.log('GET product id=', id, 'for user=', userId);
    const product = await getProductById(id, userId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const addProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description, price, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const payload = { user_id: userId, name, description, price, category };
    console.log('POST create product user=', userId, 'payload=', payload);
    const id = await createProduct(payload);
    res.status(201).json({ id, message: 'Product created' });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const editProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const { name, description, price, category } = req.body;
    
    const payload = { name, description, price, category };
    console.log('PUT update product id=', id, 'user=', userId, 'payload=', payload);
    const affected = await updateProduct(id, userId, payload);
    if (affected === 0) {
      return res.status(404).json({ error: 'Product not found or not authorized' });
    }
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const removeProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    console.log('DELETE product id=', id, 'for user=', userId);
    const affected = await deleteProduct(id, userId);
    if (affected === 0) {
      return res.status(404).json({ error: 'Product not found or not authorized' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct
};

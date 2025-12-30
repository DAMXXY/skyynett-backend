const express = require('express');
const store = require('../data/store');
const upload = require('../middleware/upload');
const router = express.Router();

// GET products by category
router.get('/category/:categoryId', (req, res) => {
  try {
    const products = store.getProductsByCategory(req.params.categoryId);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product (accept optional file upload)
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { categoryId, title, description, price } = req.body;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const product = store.createProduct({ categoryId, title, description, price: parseFloat(price), imageUrl });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', (req, res) => {
  try {
    const ok = store.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
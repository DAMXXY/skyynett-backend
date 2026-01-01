const express = require('express');
const fs = require('fs');
const store = require('../data/store');
const upload = require('../middleware/upload_clean');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// GET all products
router.get('/', (req, res) => {
  try {
    const products = store.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { categoryId, title, description, price } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      // Upload to Cloudinary and remove the local file
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      imageUrl = result.secure_url;
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('Failed to remove temp product upload:', err.message);
      });
    }

    const product = store.createProduct({
      categoryId,
      title,
      description,
      price: parseFloat(price),
      imageUrl
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', (req, res) => {
  try {
    const ok = store.deleteProduct(req.params.id);
    if (!ok) {
      // Helpful debug info when deletion fails on deployed server
      const existing = store.getAllProducts().map(p => p._id);
      return res.status(404).json({ message: 'Product not found', existingIds: existing });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
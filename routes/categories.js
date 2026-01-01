const express = require('express');
const store = require('../data/store');
const upload = require('../middleware/upload_clean');
const router = express.Router();

// GET all categories
router.get('/', (req, res) => {
  try {
    const categories = store.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new category (accept optional image upload in multipart/form-data)
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl = req.body.imageUrl; // optional if client sent a URL
    if (req.file) {
      // store relative path to serve via /uploads
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const category = store.createCategory({ name, imageUrl });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update category
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;
    const updated = store.updateCategory(id, { name });
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category
router.delete('/:id', (req, res) => {
  try {
    const ok = store.deleteCategory(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
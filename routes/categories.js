const express = require('express');
const fs = require('fs');
const store = require('../data/store');
const upload = require('../middleware/upload_clean');
const cloudinary = require('../config/cloudinary');
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
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl = req.body.imageUrl; // optional if client sent a URL

    if (req.file) {
      // Upload file saved by multer to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'categories' });
      imageUrl = result.secure_url;
      // remove local file copy
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('Failed to remove temp upload:', err.message);
      });
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
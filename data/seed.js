const fs = require('fs');
const path = require('path');
const store = require('./store');

async function seedFromImages() {
  try {
    const imagesDir = path.resolve(__dirname, '..', '..', 'images');
    if (!fs.existsSync(imagesDir)) return;
    const entries = fs.readdirSync(imagesDir, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory()).map(d => d.name);
    const existing = store.getCategories().map(c => c.name.toLowerCase());
    for (const name of folders) {
      if (!existing.includes(name.toLowerCase())) {
        store.createCategory({ name });
      }
    }
    console.log('✅ Seeded categories from images folder');
  } catch (err) {
    console.error('Seed error', err);
  }
}

module.exports = { seedFromImages };

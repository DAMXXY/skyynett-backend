const fs = require('fs');
const path = require('path');
const store = require('../data/store');

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9\-]/g, '');
}

async function run() {
  const imagesDir = path.resolve(__dirname, '..', '..', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.error('images folder not found:', imagesDir);
    process.exit(1);
  }

  const entries = fs.readdirSync(imagesDir, { withFileTypes: true });
  const folders = entries.filter(e => e.isDirectory()).map(d => d.name);

  for (const folder of folders) {
    const catName = folder;
    const cat = store.createCategory({ name: catName, imageUrl: `/images/${folder}/${encodeURIComponent(fs.readdirSync(path.join(imagesDir, folder))[0] || '')}` });
    console.log('Created/Found category:', cat.name);

    const files = fs.readdirSync(path.join(imagesDir, folder)).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
    for (const file of files) {
      const title = path.parse(file).name.replace(/[-_]+/g, ' ');
      const imageUrl = `/images/${folder}/${encodeURIComponent(file)}`;
      const price = Math.floor(Math.random() * 900) + 99; // random placeholder price
      const prod = store.createProduct({ categoryId: cat._id, title, description: title, price, imageUrl });
      console.log('  -> added product', prod.title);
    }
  }

  console.log('Import complete');
}

run().catch(err => { console.error(err); process.exit(1); });

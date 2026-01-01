const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { categories: [], products: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('readDB error', err);
    return { categories: [], products: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('writeDB error', err);
  }
}

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = {
  getCategories: () => {
    const db = readDB();
    return db.categories || [];
  },
  createCategory: ({ name, imageUrl }) => {
    const db = readDB();
    const exists = db.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return exists;
    const cat = { _id: generateId('cat_'), name };
    if (imageUrl) cat.imageUrl = imageUrl;
    db.categories.push(cat);
    writeDB(db);
    return cat;
  },
  updateCategory: (id, { name }) => {
    const db = readDB();
    const idx = db.categories.findIndex(c => c._id === id);
    if (idx === -1) return null;
    db.categories[idx].name = name;
    writeDB(db);
    return db.categories[idx];
  },
  deleteCategory: (id) => {
    const db = readDB();
    const idx = db.categories.findIndex(c => c._id === id);
    if (idx === -1) return false;
    // remove any products in that category as well
    db.products = db.products.filter(p => p.categoryId !== id);
    db.categories.splice(idx, 1);
    writeDB(db);
    return true;
  },
  getProductsByCategory: (categoryId) => {
    const db = readDB();
    return db.products.filter(p => p.categoryId === categoryId);
  },
  getAllProducts: () => {
    const db = readDB();
    return db.products || [];
  },
  createProduct: ({ categoryId, title, description, price, imageUrl }) => {
    const db = readDB();
    const prod = { _id: generateId('prod_'), categoryId, title, description, price, imageUrl, createdAt: new Date().toISOString() };
    db.products.push(prod);
    writeDB(db);
    return prod;
  },
  deleteProduct: (productId) => {
    const db = readDB();
    const idx = db.products.findIndex(p => p._id === productId);
    if (idx === -1) return false;
    db.products.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

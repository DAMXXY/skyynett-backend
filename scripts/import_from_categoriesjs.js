const fs = require('fs');
const path = require('path');
const vm = require('vm');
const store = require('../data/store');

// categories.js lives at the repository root. From this script (admin-dashboard/server/scripts)
// we need to go up three levels to reach the project root.
const CATEGORIES_JS = path.resolve(__dirname, '..', '..', '..', 'categories.js');

function parseCategoriesData(jsSource) {
  // Find the `let categoriesData = { ... };` block
  const match = jsSource.match(/let\s+categoriesData\s*=\s*({[\s\S]*?});/m);
  if (!match) return null;
  const objText = match[1];
  // Wrap in parentheses to make it an expression
  const wrapped = '(' + objText + ')';
  // Use VM to evaluate safely
  const script = new vm.Script(wrapped, { filename: 'categoriesData.vm.js' });
  const ctx = vm.createContext({});
  const result = script.runInContext(ctx);
  return result;
}

function parsePrice(priceStr) {
  if (priceStr == null) return 0;
  if (typeof priceStr === 'number') return priceStr;
  const cleaned = String(priceStr).replace(/[^0-9.\-]+/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function run() {
  if (!fs.existsSync(CATEGORIES_JS)) {
    console.error('categories.js not found at', CATEGORIES_JS);
    process.exit(1);
  }

  const src = fs.readFileSync(CATEGORIES_JS, 'utf8');
  const map = parseCategoriesData(src);
  if (!map) {
    console.error('Could not find `let categoriesData = {...}` in categories.js');
    process.exit(1);
  }

  console.log('Found categories:', Object.keys(map));

  for (const key of Object.keys(map)) {
    const entries = map[key] || [];
    const catName = key;
    // create or get category
    const cat = store.createCategory({ name: catName });
    console.log('Category:', cat.name, '->', cat._id);

    for (const p of entries) {
      const title = p.name || p.title || 'Untitled';
      const price = parsePrice(p.price);
      const image = p.image || p.imageUrl || null;
      const description = p.description || '';

      // avoid duplicate products by image or title in same category
      const existing = store.getProductsByCategory(cat._id).find(prod => (prod.imageUrl && image && prod.imageUrl === image) || (prod.title === title));
      if (existing) {
        console.log('  skipping existing product:', title);
        continue;
      }

      const prod = store.createProduct({ categoryId: cat._id, title, description, price, imageUrl: image });
      console.log('  added product:', prod.title, prod._id);
    }
  }

  console.log('Import finished.');
}

run().catch(err => { console.error(err); process.exit(1); });

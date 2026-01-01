require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const aiRoutes = require('./routes/ai');
const { seedFromImages } = require('./data/seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve repository images folder so seeded images are accessible from the public site
app.use('/images', express.static(path.join(__dirname, '..', '..', 'images')));

// Connect DB (only if MONGO_URI is provided)
if (process.env.MONGO_URI) {
  try {
    connectDB();
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
} else {
  console.log('ℹ️  MONGO_URI not set — using file-based JSON store (no MongoDB)');
}

// Seed JSON store (if using file store) from images folder
seedFromImages().catch(() => {});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Health route
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running....`));

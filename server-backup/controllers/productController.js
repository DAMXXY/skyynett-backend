// server/controllers/productController.js

const Product = require('../models/Product');
const Category = require('../models/Category');

// Fetch all products by category ID
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.id });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

// Add a new product
exports.addProduct = async (req, res) => {
    const { title, description, price, categoryId } = req.body;
    const imageUrl = req.file.path; // Assuming image upload middleware is used

    const newProduct = new Product({
        title,
        description,
        price,
        categoryId,
        imageUrl
    });

    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
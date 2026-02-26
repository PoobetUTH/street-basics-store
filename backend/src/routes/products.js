const express = require('express');
const Product = require('../models/product');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  const products = await Product.findAll();
  res.json({ products });
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'ไม่พบสินค้า' });
  }
  res.json({ product });
});

module.exports = router;

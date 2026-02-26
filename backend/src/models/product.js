const { query } = require('../database/connection');

const Product = {
  async findAll() {
    const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC');
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async updateStock(id, quantityToDeduct) {
    return query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantityToDeduct, id]);
  },
};

module.exports = Product;

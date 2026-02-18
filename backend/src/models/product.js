const db = require('../database/connection');

const Product = {
  findAll() {
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  updateStock(id, quantityToDeduct) {
    return db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantityToDeduct, id);
  },
};

module.exports = Product;

const { pool, query } = require('../database/connection');
const Product = require('./product');

const Order = {
  async create(userId, items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const { rows } = await client.query('SELECT * FROM products WHERE id = $1', [item.productId]);
        const product = rows[0];

        if (!product) {
          throw new Error(`ไม่พบสินค้า ID: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`สินค้า "${product.name}" มีไม่เพียงพอ`);
        }
        total += parseFloat(product.price) * item.quantity;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Create order record
      const { rows: orderRows } = await client.query(
        'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
        [userId, total]
      );
      const orderId = orderRows[0].id;

      // Create order items and update stock
      for (const item of orderItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.quantity, item.price]
        );
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      await client.query('COMMIT');
      return { orderId, total };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findByUserId(userId) {
    const { rows: orders } = await query(`
      SELECT o.*,
        json_agg(json_build_object(
          'productId', oi.product_id,
          'productName', p.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'image', p.image
        )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    return orders;
  },
};

module.exports = Order;

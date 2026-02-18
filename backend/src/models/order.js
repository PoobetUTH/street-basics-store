const db = require('../database/connection');
const Product = require('./product');

const Order = {
  create(userId, items) {
    const createOrder = db.transaction(() => {
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const product = Product.findById(item.productId);
        if (!product) {
          throw new Error(`ไม่พบสินค้า ID: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`สินค้า "${product.name}" มีไม่เพียงพอ`);
        }
        total += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Create order record
      const orderResult = db.prepare(
        'INSERT INTO orders (user_id, total) VALUES (?, ?)'
      ).run(userId, total);

      const orderId = orderResult.lastInsertRowid;

      // Create order items and update stock
      for (const item of orderItems) {
        db.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        ).run(orderId, item.productId, item.quantity, item.price);

        Product.updateStock(item.productId, item.quantity);
      }

      return { orderId, total };
    });

    return createOrder();
  },

  findByUserId(userId) {
    const orders = db.prepare(`
      SELECT o.*,
        json_group_array(json_object(
          'productId', oi.product_id,
          'productName', p.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'image', p.image
        )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(userId);

    return orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }));
  },
};

module.exports = Order;

const express = require('express');
const Order = require('../models/order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — Create new order
router.post('/', authenticateToken, async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' });
  }

  try {
    const result = await Order.create(req.user.id, items);

    res.status(201).json({
      message: 'สั่งซื้อสำเร็จ!',
      order: {
        id: result.orderId,
        total: result.total,
        status: 'pending',
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders — Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  const orders = await Order.findByUserId(req.user.id);
  res.json({ orders });
});

module.exports = router;

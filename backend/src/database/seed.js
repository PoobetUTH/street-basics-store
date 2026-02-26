const { pool } = require('./connection');

async function seedProducts() {
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM products');
  if (parseInt(rows[0].count) > 0) {
    console.log(`✅ Products already seeded (${rows[0].count} items)`);
    return;
  }

  const products = [
    {
      name: 'Whitey Shirt',
      price: 10.00,
      image: 'assets/images/prod-1.png',
      description: 'A clean white shirt perfect for any occasion. Made from premium cotton.',
      category: 'shirts',
    },
    {
      name: 'Sonaya Sweater',
      price: 8.00,
      image: 'assets/images/prod-4.png',
      description: 'Cozy and stylish sweater for cold weather. Soft and comfortable.',
      category: 'sweaters',
    },
    {
      name: 'Simple Shirt',
      price: 8.00,
      image: 'assets/images/prod-3.png',
      description: 'A minimalist shirt for everyday wear. Lightweight and breathable.',
      category: 'shirts',
    },
    {
      name: 'Tomi Shirt',
      price: 9.00,
      image: 'assets/images/prod-2.png',
      description: 'Trendy shirt with a modern cut. Perfect for casual outings.',
      category: 'shirts',
    },
    {
      name: 'Classic Denim Jacket',
      price: 25.00,
      image: 'assets/images/pict1.jpg',
      description: 'Timeless denim jacket that goes with everything. Durable and fashionable.',
      category: 'jackets',
    },
    {
      name: 'Urban Hoodie',
      price: 15.00,
      image: 'assets/images/pict2.jpg',
      description: 'Street-style hoodie for the modern urban look. Warm and trendy.',
      category: 'hoodies',
    },
    {
      name: 'Vintage Leather Jacket',
      price: 35.00,
      image: 'assets/images/pict3.jpg',
      description: 'Premium vintage leather jacket with a rugged look. Built to last.',
      category: 'jackets',
    },
    {
      name: 'Casual Polo Shirt',
      price: 12.00,
      image: 'assets/images/preview-1.jpg',
      description: 'Smart casual polo shirt for work or weekend. Comfortable and stylish.',
      category: 'shirts',
    },
    {
      name: 'Oversized Streetwear Tee',
      price: 14.00,
      image: 'assets/images/preview-2.jpg',
      description: 'Trendy oversized tee with a relaxed fit. Perfect for street style.',
      category: 'shirts',
    },
    {
      name: 'Winter Wool Sweater',
      price: 20.00,
      image: 'assets/images/prod-4.png',
      description: 'Thick wool sweater for the coldest days. Ultra warm and soft.',
      category: 'sweaters',
    },
    {
      name: 'Graphic Print Tee',
      price: 11.00,
      image: 'assets/images/prod-1.png',
      description: 'Bold graphic print for those who want to stand out. 100% cotton.',
      category: 'shirts',
    },
    {
      name: 'Slim Fit Chino Pants',
      price: 18.00,
      image: 'assets/images/prod-2.png',
      description: 'Modern slim fit chino pants. Versatile and comfortable for any occasion.',
      category: 'pants',
    },
  ];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of products) {
      await client.query(
        'INSERT INTO products (name, price, image, description, category) VALUES ($1, $2, $3, $4, $5)',
        [p.name, p.price, p.image, p.description, p.category]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Seeded ${products.length} products into database`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  const { initDB } = require('./connection');
  initDB()
    .then(() => seedProducts())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedProducts };

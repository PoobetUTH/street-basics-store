const db = require('./connection');

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count > 0) {
    console.log(`✅ Products already seeded (${count.count} items)`);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO products (name, price, image, description, category)
    VALUES (@name, @price, @image, @description, @category)
  `);

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
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item);
    }
  });

  insertMany(products);
  console.log(`✅ Seeded ${products.length} products into database`);
}

// Run if called directly
if (require.main === module) {
  seedProducts();
  process.exit(0);
}

module.exports = { seedProducts };

const app = require('./app');
const config = require('./config');
const { initDB } = require('./database/connection');
const { seedProducts } = require('./database/seed');

// Start server with async initialization
(async () => {
  try {
    // Initialize database tables
    await initDB();

    // Seed products on startup
    await seedProducts();

    // Start server
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`\n🚀 STREET BASICS API Server`);
      console.log(`   Port:    ${config.port}`);
      console.log(`   Mode:    ${config.nodeEnv}`);
      console.log(`   DB:      PostgreSQL`);
      console.log(`   CORS:    ${config.cors.origin}`);
      console.log(`   Health:  http://localhost:${config.port}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

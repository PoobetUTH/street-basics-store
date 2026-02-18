const app = require('./app');
const config = require('./config');
const { seedProducts } = require('./database/seed');

// Seed products on startup
seedProducts();

// Start server
app.listen(config.port, () => {
  console.log(`\n🚀 STREET BASICS API Server`);
  console.log(`   Port:    ${config.port}`);
  console.log(`   Mode:    ${config.nodeEnv}`);
  console.log(`   CORS:    ${config.cors.origin}`);
  console.log(`   Health:  http://localhost:${config.port}/api/health\n`);
});

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Inject API_BASE into HTML pages
app.get('*.html', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

// SPA fallback — serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎨 STREET BASICS Frontend`);
  console.log(`   Port:     ${PORT}`);
  console.log(`   API Base: ${API_BASE}`);
  console.log(`   URL:      http://localhost:${PORT}\n`);
});

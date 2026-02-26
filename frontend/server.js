const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Inject API_BASE into HTML pages FIRST
const fs = require('fs');
app.get('*.html', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', req.path);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return next();
    // Inject the variable before the closing head tag
    const injected = data.replace(
      '</head>',
      `<script>window.__API_BASE__ = "${API_BASE}";</script></head>`
    );
    res.send(injected);
  });
});

// Serve static files AFTER html injection
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback — serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎨 STREET BASICS Frontend`);
  console.log(`   Port:     ${PORT}`);
  console.log(`   API Base: ${API_BASE}`);
  console.log(`   URL:      http://localhost:${PORT}\n`);
});

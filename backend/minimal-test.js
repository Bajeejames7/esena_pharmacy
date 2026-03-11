#!/usr/bin/env node

/**
 * Absolute minimal Node.js server for testing
 */

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Minimal server working',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});

module.exports = server;
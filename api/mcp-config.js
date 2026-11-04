'use strict';
const { config } = require('../mcp-sombrear/config.cjs');
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.statusCode = 405; return res.end(); }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(config()));
};

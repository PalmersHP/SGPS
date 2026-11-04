'use strict';
// Local development binds only to loopback. Production uses api/mcp.js on Vercel.
const http = require('node:http');
const { config } = require('./config.cjs');
const { createStore } = require('./store.cjs');
const { createOperations } = require('./operacoes.cjs');
const { createHandler } = require('./handler.cjs');
const { resourceMetadata } = require('./auth.cjs');
const port = Number(process.env.PORT || 8787);
const settings = { ...config(), resourceUrl: process.env.MCP_RESOURCE_URL || `http://127.0.0.1:${port}/api/mcp` };
const handler = createHandler({ config: settings, operations: createOperations({ store: createStore(settings) }) });
http.createServer((req, res) => {
  if (req.url.split('?')[0] === '/api/mcp') return handler(req, res);
  if (req.url.startsWith('/.well-known/oauth-protected-resource')) {
    res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(resourceMetadata(settings)));
  }
  res.statusCode = 404; res.end();
}).listen(port, '127.0.0.1', () => console.error(`MCP local em http://127.0.0.1:${port}/api/mcp`));

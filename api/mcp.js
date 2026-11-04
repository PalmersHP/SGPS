'use strict';
const { config } = require('../mcp-sombrear/config.cjs');
const { createStore } = require('../mcp-sombrear/store.cjs');
const { createOperations } = require('../mcp-sombrear/operacoes.cjs');
const { createHandler } = require('../mcp-sombrear/handler.cjs');
const settings = config();
module.exports = createHandler({ config: settings, operations: createOperations({ store: createStore(settings) }) });

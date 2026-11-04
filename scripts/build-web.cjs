'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
fs.mkdirSync(output, { recursive: true });
// Only browser assets are published. Server code, private configuration and backups
// must never be exposed by a static deployment of this repository.
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && (/\.(html|css|js|svg|ico|webmanifest)$/i.test(entry.name) || ['logo.png', 'Logo Sombrear.png'].includes(entry.name))) {
    fs.copyFileSync(path.join(root, entry.name), path.join(output, entry.name));
  }
}
console.log('Arquivos web preparados em public/.');

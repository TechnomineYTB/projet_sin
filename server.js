const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
// '0.0.0.0' = écoute sur toutes les interfaces (accessible via l'IP de la machine)
// Mets une IP précise (ex: '192.168.1.20') pour n'écouter que sur celle-ci
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Retire les paramètres d'URL (?a=b) et décode les caractères spéciaux
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // Sécurité : empêche de sortir du dossier "public" (ex: /../server.js)
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 - Accès interdit');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 - Page introuvable</h1>');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, HOST, () => {
  console.log('Serveur lancé. Accessible via :');
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const iface of interfaces) {
      if (iface.family === 'IPv4') {
        console.log(`  http://${iface.address}:${PORT}`);
      }
    }
  }
});
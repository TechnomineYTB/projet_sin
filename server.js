const http = require('http'); //bibliotheque pour pouvoir utiliser comme server
const fs = require('fs'); // aucune idée
const path = require('path'); // permet de trouver les chemins pour le sites

const PORT = 3000; // définit le port pour le server
const PUBLIC_DIR = path.join(__dirname, 'public'); // définis les chemins des éléments

const MIME_TYPES = { // définis les différents types de fichiers permis sur le site
  '.html': 'text/html; charset=utf-8', // pour l'HTML
  '.css': 'text/css; charset=utf-8', // pour le CSS
  '.js': 'text/javascript; charset=utf-8', // pour les fichiers javascript
  '.json': 'application/json', // pour les fichiers JSON
  '.png': 'image/png', // pour les images png
  '.jpg': 'image/jpeg', // pour les images png
  '.jpeg': 'image/jpeg', // pour les images png
  '.gif': 'image/gif', // pour les images png
  '.svg': 'image/svg+xml', // pour les images png
  '.webp': 'image/webp', // pour les images png
  '.ico': 'image/x-icon', // pour les images png
};

//création du server
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
// lit les fichier et regarde si ils sont trouvables
  fs.readFile(filePath, (err, content) => { // lis les liens de fichiers
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); // regarde l'HTML
      return res.end('<h1>404 - Page introuvable</h1>'); // si la page n'est pas trouvé
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

// lance le server
server.listen(PORT, () => {
  console.log(`Serveur lancé : http://localhost:${PORT}`);
});

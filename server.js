const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const ESP_KEY = process.env.ESP_KEY || 'change-me'; // doit être identique dans le sketch ESP32

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const espWss = new WebSocketServer({ noServer: true });
const uiWss = new WebSocketServer({ noServer: true });

let espSocket = null;
const state = { online: false, led: false, rssi: null, heap: null, uptime: null, lastSeen: null };

function broadcastState() {
  const msg = JSON.stringify({ type: 'state', ...state });
  for (const c of uiWss.clients) if (c.readyState === 1) c.send(msg);
}

function sendToEsp(obj) {
  if (!espSocket || espSocket.readyState !== 1) return false;
  espSocket.send(JSON.stringify(obj));
  return true;
}

// Routage des connexions WebSocket : /esp pour la carte, /ui pour les navigateurs
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/esp') {
    if (url.searchParams.get('key') !== ESP_KEY) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      return socket.destroy();
    }
    espWss.handleUpgrade(req, socket, head, (ws) => espWss.emit('connection', ws, req));
  } else if (url.pathname === '/ui') {
    uiWss.handleUpgrade(req, socket, head, (ws) => uiWss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});

// --- ESP32 ---
espWss.on('connection', (ws, req) => {
  console.log('ESP32 connecté depuis', req.socket.remoteAddress);
  if (espSocket) espSocket.terminate(); // une seule carte à la fois
  espSocket = ws;
  ws.isAlive = true;
  state.online = true;
  state.lastSeen = Date.now();
  broadcastState();

  ws.on('pong', () => (ws.isAlive = true));
  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    if (msg.type === 'telemetry') {
      state.led = !!msg.led;
      state.rssi = msg.rssi;
      state.heap = msg.heap;
      state.uptime = msg.uptime;
      state.lastSeen = Date.now();
      broadcastState();
    }
  });
  ws.on('close', () => {
    if (espSocket === ws) {
      espSocket = null;
      state.online = false;
      console.log('ESP32 déconnecté');
      broadcastState();
    }
  });
});

// --- Navigateurs ---
uiWss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
  ws.send(JSON.stringify({ type: 'state', ...state }));

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    if (msg.type === 'led') {
      const ok = sendToEsp({ type: 'led', value: !!msg.value });
      if (!ok) ws.send(JSON.stringify({ type: 'error', text: "L'ESP32 n'est pas connecté." }));
    }
  });
});

// --- API REST (pratique pour tester avec curl) ---
app.get('/api/state', (req, res) => res.json(state));
app.post('/api/led', (req, res) => {
  const ok = sendToEsp({ type: 'led', value: !!req.body.value });
  res.status(ok ? 200 : 503).json({ ok });
});

// Détection des connexions mortes (ping toutes les 15 s)
setInterval(() => {
  for (const wss of [espWss, uiWss]) {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
  }
}, 15000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur prêt sur http://0.0.0.0:${PORT}`);
});

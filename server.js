const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { initialData, addProduct, registerSale, restockProduct, summary } = require('./src/domain');

const port = Number(process.env.PORT || 3000);
let state = initialData();

function respond(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 250000) throw new Error('Solicitud demasiado grande');
  }
  try { return JSON.parse(raw || '{}'); } catch { throw new Error('JSON inválido'); }
}
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return respond(res, 200, { ok: true, demo: true });
    if (req.method === 'GET' && url.pathname === '/api/state') return respond(res, 200, { ...state, summary: summary(state) });
    if (req.method === 'POST' && url.pathname === '/api/products') {
      state = addProduct(state, await body(req));
      return respond(res, 201, { ...state, summary: summary(state) });
    }
    if (req.method === 'POST' && url.pathname === '/api/sales') {
      state = registerSale(state, await body(req));
      return respond(res, 201, { ...state, summary: summary(state) });
    }
    if (req.method === 'POST' && url.pathname === '/api/restocks') {
      state = restockProduct(state, await body(req));
      return respond(res, 201, { ...state, summary: summary(state) });
    }
    if (req.method === 'POST' && url.pathname === '/api/reset') {
      state = initialData();
      return respond(res, 200, { ...state, summary: summary(state) });
    }
    if (req.method !== 'GET') return respond(res, 404, { error: 'Ruta no encontrada' });
    const filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
    const relative = path.relative(path.join(__dirname, 'public'), filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return respond(res, 403, { error: 'Acceso denegado' });
    const content = await fs.promises.readFile(filePath);
    res.writeHead(200, { 'Content-Type': (mime[path.extname(filePath)] || 'application/octet-stream') + '; charset=utf-8' });
    res.end(content);
  } catch (err) {
    respond(res, err.code === 'ENOENT' ? 404 : 400, { error: err.code === 'ENOENT' ? 'No encontrado' : err.message });
  }
});
if (require.main === module) server.listen(port, () => console.log('Net-Gestión Demo: http://localhost:' + port));
module.exports = server;


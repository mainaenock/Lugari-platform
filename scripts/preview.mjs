import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const port = Number(process.env.PORT || 4180);
const types = new Map(Object.entries({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' }));
function isFile(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}

createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const requested = resolve(root, '.' + pathname);
  if (requested !== resolve(root) && !requested.startsWith(resolve(root) + sep)) { res.writeHead(400).end(); return; }
  const index = resolve(requested, 'index.html');
  const file = isFile(requested) ? requested : isFile(index) ? index : resolve(root, '404.html');
  if (!isFile(file)) { res.writeHead(404).end('Run npm run build before starting the preview.'); return; }
  const status = file === resolve(root, '404.html') ? 404 : 200;
  res.writeHead(status, { 'Content-Type': types.get(extname(file)) || 'application/octet-stream', 'Content-Length': statSync(file).size, 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log('Lugari preview at http://127.0.0.1:' + port + '/'));

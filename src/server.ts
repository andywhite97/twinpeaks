import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import { environment } from './environments/environment';
import { allowedHost, compressionEncoding, securityHeaders, staticCache } from './hosting-policy';

const browserFolder = resolve(dirname(fileURLToPath(import.meta.url)), '../browser');
const angularApp = new AngularNodeAppEngine({ allowedHosts: [new URL(environment.siteUrl).hostname, 'localhost', '127.0.0.1'] });
const types: Record<string, string> = { '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain', '.json': 'application/json' };

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  for (const [key, value] of Object.entries(securityHeaders)) res.setHeader(key, value);
  res.setHeader('Cache-Control', 'no-cache');
  if (!allowedHost(req.headers.host, environment.siteUrl) || !req.url?.startsWith('/') || req.url.startsWith('//')) {
    res.writeHead(400, { 'Cache-Control': 'no-store' }); res.end('Invalid request'); return;
  }
  if (!['GET', 'HEAD'].includes(req.method ?? '')) { res.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' }); res.end('Method not allowed'); return; }
  let pathname: string;
  try { pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname); }
  catch { res.writeHead(400, { 'Cache-Control': 'no-store' }); res.end('Invalid URL'); return; }
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (['/contact', '/request-quote'].includes(pathname.replace(/\/$/, ''))) res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (pathname.startsWith('/quotations/')) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  const redirects: Record<string, string> = { '/services': '/solutions', '/gallery': '/projects', '/leadership': '/about' };
  const redirectPath = pathname.replace(/\/$/, '');
  const redirect = Object.hasOwn(redirects, redirectPath) ? redirects[redirectPath] : undefined;
  if (redirect) { res.writeHead(301, { Location: redirect, 'Cache-Control': 'no-cache' }); res.end(); return; }
  const file = resolve(browserFolder, '.' + pathname);
  try {
    if (file.startsWith(browserFolder + sep) && statSync(file).isFile() && !['.html', '.map'].includes(extname(file))) {
      res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
      res.setHeader('Cache-Control', staticCache(pathname));
      let servedFile = file;
      if (['.js', '.css', '.json', '.svg', '.txt', '.ttf'].includes(extname(file))) {
        res.setHeader('Vary', 'Accept-Encoding');
        const encoding = compressionEncoding(req.headers['accept-encoding']);
        if (encoding) { try { const compressed = file + (encoding === 'br' ? '.br' : '.gz'); if (statSync(compressed).isFile()) { servedFile = compressed; res.setHeader('Content-Encoding', encoding); } } catch { /* Uncompressed builds still work. */ } }
      }
      res.setHeader('Content-Length', statSync(servedFile).size);
      if (req.method === 'HEAD') { res.end(); return; }
      createReadStream(servedFile).pipe(res); return;
    }
  } catch { /* Route requests are handled by Angular. */ }
  try {
    const response = await angularApp.handle(req);
    if (response) await writeResponseToNodeResponse(response, res);
    else { res.writeHead(404); res.end('Page not found'); }
  } catch {
    res.writeHead(503, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' });
    res.end('TwinPeaks is temporarily unavailable. Please try again.');
  }
}

export const reqHandler = createNodeRequestHandler(handle);
if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4001);
  createServer(handle).listen(port, () => console.log(`TwinPeaks v2 listening on port ${port}`));
}

const { existsSync, readFileSync, writeFileSync, rmSync, readdirSync, copyFileSync } = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist/gh-pages/browser');
const site = 'https://twinpeaksinvestment.com';
const urls = [];
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { inspect(file); continue; }
    if (entry.name !== 'index.html') continue;
    const route = '/' + path.relative(root, directory).replaceAll(path.sep, '/');
    const html = readFileSync(file, 'utf8');
    if (route === '/404') continue;
    if (!html.includes('<h1') || !html.includes('rel="canonical"') || /name="robots" content="noindex/.test(html)) throw new Error(`Invalid prerender: ${route}`);
    if (/temporarily unavailable|could not load|Please try again in a moment/.test(html)) throw new Error(`API error in prerender: ${route}`);
    urls.push(site + route);
  }
}
inspect(root);
if (!urls.includes(site + '/blog') || urls.length < 13) throw new Error('Missing public pages');
// Preserve a generic client shell for private links and newly published routes.
// A homepage copy here would leak homepage canonical/schema into every 404.
const shell = path.join(root, 'index.csr.html');
if (!existsSync(shell)) throw new Error('Missing client fallback shell');
copyFileSync(shell, path.join(root, '404.html'));
writeFileSync(path.join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.sort().map(url => `<url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`).join('') + '</urlset>\n');
writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /quotations/\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync(path.join(root, '.nojekyll'), '');
writeFileSync(path.join(root, 'CNAME'), 'twinpeaksinvestment.com\n');
rmSync(path.join(root, '_headers'), { force: true });
console.log(`Verified ${urls.length} prerendered public pages and sitemap.`);

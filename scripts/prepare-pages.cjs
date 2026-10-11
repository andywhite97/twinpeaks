const { copyFileSync, existsSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../dist/gh-pages/browser');
const index = path.join(root, 'index.html');
if (!existsSync(index)) throw new Error('Pages browser index was not generated');
if (!readFileSync(index, 'utf8').includes('<base href="/">')) {
  throw new Error('The custom-domain Pages build requires base href /');
}
// GitHub serves this shell for direct Angular route URLs, preserving the URL.
copyFileSync(index, path.join(root, '404.html'));
writeFileSync(path.join(root, '.nojekyll'), '');
writeFileSync(path.join(root, 'CNAME'), 'twinpeaksinvestment.com\n');
writeFileSync(path.join(root, 'robots.txt'), 'User-agent: *\nDisallow: /quotations/\nDisallow: /privacy\nDisallow: /terms\n');
// GitHub Pages does not implement the SSR host's custom header configuration.
rmSync(path.join(root, '_headers'), { force: true });
console.log('Prepared gh-pages/browser with custom domain and Angular route fallback.');

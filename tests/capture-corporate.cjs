// Read-only capture against the configured development API (ordinary local backend).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'test-results');
let app, browser; let serverLog = ''; const errors = [], requests = [];
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { app?.kill(); process.exit(130); });
(async () => {
  app = spawn(process.execPath, ['dist/front-v2/server/server.mjs'], { cwd: root, env: { ...process.env, PORT: '18183' }, stdio: ['ignore', 'pipe', 'pipe'] });
  app.stdout.on('data', chunk => serverLog += chunk); app.stderr.on('data', chunk => serverLog += chunk);
  let ready = false;
  for (let i = 0; i < 80; i++) { if (app.exitCode !== null) throw Error(serverLog); try { if ((await fetch('http://127.0.0.1:18183/', { signal: AbortSignal.timeout(1500) })).ok) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 100)); }
  assert(ready, 'Development SSR server did not start');
  const imageResponse = await fetch('http://127.0.0.1:18183/assets/images/security-concept.webp');
  assert.equal(imageResponse.headers.get('content-type'), 'image/webp');
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(String(error))); page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  const pages = [['about', '/about'], ['contact', '/contact'], ['request-quote', '/request-quote']];
  for (const theme of ['light', 'dark']) for (const [name, route] of pages) {
    await page.goto('http://127.0.0.1:18183/'); await page.evaluate(theme => localStorage.setItem('twinpeaks-theme', theme), theme);
    await page.goto('http://127.0.0.1:18183' + route); await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready);
    // Full-page captures must load below-fold images that a scrolled visitor would see.
    await page.evaluate(() => { for (const image of document.images) image.loading = 'eager'; });
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
    assert.equal(await page.locator('h1').count(), 1); assert(!(await page.locator('main').textContent()).includes('matching service record'));
    for (const width of [320, 375, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 1000 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} ${theme} overflow ${width}`); }
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); } scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await page.screenshot({ path: path.join(output, `phase3-${name}-${theme}.png`), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, `phase3-${name}-${theme}-mobile.png`), fullPage: true });

    await page.setViewportSize({ width: 1440, height: 1000 });
    if (name === 'solutions') { const heights = await page.locator('.solution-card').evaluateAll(cards => cards.map(card => card.getBoundingClientRect().height)); for (const row of [heights.slice(0,3), heights.slice(3)]) assert(Math.max(...row) - Math.min(...row) < 2, 'Desktop solution cards should share row height'); }
  }
  assert.deepEqual(errors, []); assert(requests.every(request => request.method === 'GET' && request.url.startsWith('http://127.0.0.1:')));
  fs.writeFileSync(path.join(output, 'phase3-local-capture.json'), JSON.stringify({ errors, requests, pages, widths: [320,375,390,768,1024,1440], source: 'Actual configured local API, GET requests only' }, null, 2));
  console.log('PASS: 12 actual-local-content captures, 36 layout/theme checks, GET-only local requests, no runtime errors');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); app?.kill(); fs.writeFileSync(path.join(output, 'phase3-local-ssr.log'), serverLog); });

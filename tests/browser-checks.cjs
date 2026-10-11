// Synthetic local API only. Requires a QA build and externally available Playwright.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const phase2 = process.env.PHASE2_QA === '1';
const phase3 = process.env.PHASE3_QA === '1';
const phase4 = process.env.PHASE4_QA === '1';
const leads = { contactMode: 'ready', quoteMode: 'ready', contactCount: 0, quoteCount: 0, contactBody: null, quoteBody: null };
let serviceMode = 'ready', detailMode = 'ready', portfolioMode = 'ready';
const fixtureProjects = [
  { id: 101, title: 'Development QA fixture — Security planning', slug: 'qa-security', category: 'Security', image: '/media/qa-one.svg', images: [{ id: 201, image: '/media/qa-two.svg', caption: 'Development QA fixture — network diagram', display_order: 0 }], short_description: 'Synthetic QA data for interface review. Not a customer project.', long_description: 'Development QA fixture only.\nThis text exercises the existing published description field without inventing client results or measurable outcomes.', location: 'QA location — not a client site', completion_date: '2026-10-01', link_url: '' },
  { id: 102, title: 'Development QA fixture — Connected access', slug: 'qa-access', category: 'Security', image: '/media/nonexistent.png', images: [], short_description: 'Synthetic QA data. Broken-image fallback test.', long_description: '', location: '', completion_date: null, link_url: '' },
  { id: 103, title: 'Development QA fixture — Network planning', slug: 'qa-network', category: 'IT Infrastructure', image: '/media/qa-two.svg', images: [], short_description: 'Synthetic QA data. Category filtering test.', long_description: '', location: '', completion_date: null, link_url: '' },
];
const output = path.join(root, 'test-results', ...(phase4 ? ['phase4'] : [])); fs.mkdirSync(output, { recursive: true });
let projectMode = 'ready', failures = [], browser, app;
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { app?.kill(); api.close(); process.exit(130); });
const apiRequests = [], browserRequests = [], errors = [];
const token = '11111111-1111-4111-8111-111111111111';
const quote = { quote_number: 'QA-SYNTHETIC', name: 'Synthetic Customer', company_name: '', email: 'qa@example.invalid', phone_number: '26876000000', address: '', message: 'Synthetic quotation for regression testing only.', status: 'sent', subtotal: '100.00', discount_amount: '0.00', tax_amount: '0.00', total: '100.00', currency: 'SZL', terms: '', valid_until: null, items: [{ title: 'Synthetic item', description: '', quantity: 1, unit_price: '100.00', discount_amount: '0.00', tax_amount: '0.00', line_total: '100.00' }] };
let quotation = { ...quote };
let decisionMode = 'ready';
const api = http.createServer(async (req, res) => {
  apiRequests.push({ method: req.method, url: req.url, referer: req.headers.referer || '' });
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method === 'OPTIONS') return res.end();
  if (req.method === 'POST' && ['/api/contact/', '/api/quotations/'].includes(req.url)) {
    const kind = req.url === '/api/contact/' ? 'contact' : 'quote';
    let raw = ''; for await (const chunk of req) raw += chunk;
    leads[kind + 'Count']++; leads[kind + 'Body'] = JSON.parse(raw);
    const mode = leads[kind + 'Mode'];
    if (mode === 'delay') await new Promise(resolve => setTimeout(resolve, 900));
    if (mode === 'timeout') { req.socket.destroy(); return; }
    if (mode === 'invalid') { res.statusCode = 400; return res.end(JSON.stringify(kind === 'contact' ? { email: ['Synthetic rejected value'] } : { phone_number: ['Synthetic rejected value'] })); }
    if (mode === 'error') { res.statusCode = 503; return res.end('{}'); }
    if (mode === 'throttle') { res.statusCode = 429; res.setHeader('Retry-After', '2'); res.setHeader('Access-Control-Expose-Headers', 'Retry-After'); return res.end('{}'); }
    res.statusCode = 201;
    if (mode === 'malformed') return res.end('{}');
    return res.end(JSON.stringify(kind === 'contact' ? { ...leads.contactBody, id: 9001, created_at: '2026-10-11T00:00:00Z' } : { quote_number: 'TP-Q-2026-9001', status: 'requested', public_access_token: token }));
  }
  if (req.url === '/api/company/') return res.end(JSON.stringify({ id: 1, name: 'TwinPeaks Investment', email: '', phone: '', whatsapp: '', address: '', business_hours: '', copyright_text: '' }));
  if (req.url === '/api/homepage/') return res.end(JSON.stringify({ hero: {}, settings: {}, solutions: [], projects: [] }));
  if (req.url === '/api/services/') {
    if (serviceMode === 'error') { res.statusCode = 503; return res.end('{}'); }
    return res.end(phase2 && serviceMode === 'ready' ? JSON.stringify([{ id: 501, title: 'Surveillance & Alarm Systems', description: 'Development QA fixture — published service description from a synthetic API record.', icon: '' }]) : '[]');
  }
  if (req.url === '/api/projects/') {
    if (portfolioMode === 'error') { res.statusCode = 503; return res.end('{}'); }
    return res.end(JSON.stringify(phase2 && portfolioMode !== 'empty' ? fixtureProjects : []));
  }
  if (req.url?.startsWith('/api/projects/') && req.url !== '/api/projects/?featured=true') {
    if (detailMode === 'error') { res.statusCode = 503; return res.end('{}'); }
    if (detailMode === 'delay') await new Promise(resolve => setTimeout(resolve, 750));
    const project = fixtureProjects.find(project => req.url === `/api/projects/${project.slug}/`);
    if (!phase2 || !project) { res.statusCode = 404; return res.end('{}'); }
    return res.end(JSON.stringify(project));
  }
  if (req.url === '/media/qa-one.svg' || req.url === '/media/qa-two.svg') {
    res.setHeader('Content-Type', 'image/svg+xml'); return res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><rect width="900" height="560" fill="#10263F"/><g stroke="#2196F3" stroke-width="8" fill="none"><rect x="150" y="100" width="180" height="120" rx="16"/><rect x="570" y="320" width="180" height="120" rx="16"/><path d="M330 160H660V320"/></g><text x="80" y="500" fill="#F5F9FF" font-family="sans-serif" font-size="26">Development QA fixture — illustrative diagram</text></svg>`);
  }
  if (req.url === '/api/projects/?featured=true') {
    if (projectMode === 'error') { res.statusCode = 503; return res.end('{}'); }
    if (projectMode === 'populated') return res.end(JSON.stringify([{ id: 1, title: 'Synthetic QA project', slug: 'synthetic-qa', short_description: 'Test response only', long_description: '', location: '', category: 'QA fixture', image: '/media/nonexistent.png', images: [], completion_date: null, link_url: '' }]));
    if (projectMode === 'delay') await new Promise(resolve => setTimeout(resolve, 1000));
    return res.end('[]'); // Honest empty portfolio: no invented projects in review screenshots.
  }
  if (req.url?.startsWith('/api/quotations/public/')) {
    if (req.url.endsWith('/pdf/')) { res.setHeader('Content-Type', 'application/pdf'); return res.end('%PDF-1.4\n% synthetic QA response only'); }
    if (req.method === 'POST') {
      if (decisionMode === 'error') { res.statusCode = 503; return res.end('{}'); }
      if (decisionMode === 'malformed') return res.end(JSON.stringify(quotation));
      let body = ''; for await (const chunk of req) body += chunk;
      quotation = { ...quotation, status: req.url.endsWith('/accept/') ? 'accepted' : 'declined', decline_reason: JSON.parse(body || '{}').reason || '' };
    }
    return res.end(JSON.stringify(quotation));
  }
  res.statusCode = 404; res.end('{}');
});
async function check(name, action) { try { await action(); console.log('PASS', name); } catch (error) { failures.push({ name, error: String(error) }); console.error('FAIL', name, error); } }
async function theme(page, value) { await page.waitForFunction(v => document.documentElement.dataset.theme === v, value); }
async function navigate(page, route = '/') { await page.goto('http://127.0.0.1:18182' + route); await page.locator('app-site-header').waitFor(); await page.waitForFunction(() => document.querySelector('app-root')?.getAttribute('ng-version')); }
(async () => {
  await new Promise((resolve, reject) => { api.once('error', reject); api.listen(18181, '127.0.0.1', resolve); });
  app = spawn(process.execPath, ['dist/front-v2/server/server.mjs'], { cwd: root, env: { ...process.env, PORT: '18182' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverLog = ''; app.stdout.on('data', chunk => { serverLog += chunk; fs.writeFileSync(path.join(output, 'ssr.log'), serverLog); }); app.stderr.on('data', chunk => { serverLog += chunk; fs.writeFileSync(path.join(output, 'ssr.log'), serverLog); });
  let started = false;
  for (let i = 0; i < 100; i++) { if (app.exitCode !== null) throw new Error('SSR server exited: ' + serverLog); try { const response = await fetch('http://127.0.0.1:18182/', { signal: AbortSignal.timeout(1000) }); if (response.ok) { started = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 100)); }
  if (!started) throw new Error('SSR server did not become ready: ' + serverLog);
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const page = await context.newPage(); page.setDefaultTimeout(10000); page.on('pageerror', e => errors.push(String(e)));
  context.on('request', req => browserRequests.push(req.url()));
  await check('SSR renders public homepage without a build-time backend dependency', async () => {
    const response = await fetch('http://127.0.0.1:18182/'); const html = await response.text(); assert(html.includes('Built on Vision')); assert(html.includes('No featured projects published yet')); assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  });
  await check('All six responsive widths and both theme layouts avoid horizontal overflow', async () => {
    await navigate(page); await theme(page, 'light');
    for (const mode of ['light', 'dark']) {
      await page.evaluate(mode => { localStorage.setItem('twinpeaks-theme', mode); }, mode); await page.reload(); await theme(page, mode);
      for (const width of [320, 375, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${mode} overflow at ${width}`);
        assert.equal(await page.locator('app-solution-card').count(), 6);
      }
      await page.screenshot({ path: path.join(output, `homepage-${mode}.png`), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, `homepage-${mode}-mobile.png`), fullPage: true });
    }
  });
  await check('Mobile menu traps focus, toggles theme, closes with Escape and restores focus', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); const open = page.getByRole('button', { name: 'Open navigation' });
    await open.click(); const dialog = page.getByRole('dialog'); await dialog.waitFor();
    for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => !!document.activeElement?.closest('dialog'))); }
    await dialog.locator('.theme-toggle').click(); await theme(page, 'light');
    await page.keyboard.press('Escape'); assert.equal(await dialog.isVisible(), false); assert(await open.evaluate(el => el === document.activeElement));
    await open.click(); await dialog.getByRole('link', { name: 'About', exact: true }).click(); await page.waitForURL('**/about'); assert.equal(await dialog.isVisible(), false);
  });
  await check('Desktop manual preference persists through reload and OS changes', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 }); await navigate(page);
    await page.evaluate(() => localStorage.setItem('twinpeaks-theme', 'light')); await page.reload(); await theme(page, 'light');
    await page.locator('.desktop-theme .theme-toggle').click(); await theme(page, 'dark'); await page.reload(); await theme(page, 'dark');
    await page.emulateMedia({ colorScheme: 'light' }); await theme(page, 'dark');
  });
  await check('System preference changes are followed without a manual override', async () => {
    await page.evaluate(() => localStorage.clear()); await page.emulateMedia({ colorScheme: 'dark' }); await page.reload(); await theme(page, 'dark');
    await page.emulateMedia({ colorScheme: 'light' }); await theme(page, 'light');
  });
  await check('Startup theme runs before application JS and tolerates blocked storage', async () => {
    const source = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
    for (const saved of [null, 'light', 'dark', 'invalid']) for (const dark of [false, true]) {
      const document = { documentElement: { dataset: {}, style: {} } }; vm.runInNewContext(source, { document, localStorage: { getItem: () => saved }, window: { matchMedia: () => ({ matches: dark }) } });
      assert.equal(document.documentElement.dataset.theme, saved === 'light' || saved === 'dark' ? saved : dark ? 'dark' : 'light');
    }
    const document = { documentElement: { dataset: {}, style: {} } }; vm.runInNewContext(source, { document, localStorage: { getItem: () => { throw Error(); } }, window: { matchMedia: () => ({ matches: true }) } }); assert.equal(document.documentElement.dataset.theme, 'dark');
  });
  await check('Homepage API failure has a working retry and honest empty state', async () => {
    projectMode = 'error'; await navigate(page); await page.getByText('Projects are temporarily unavailable', { exact: true }).waitFor();
    projectMode = 'ready'; await page.locator('app-error-state').getByRole('button').click(); await page.getByText('No featured projects published yet', { exact: true }).waitFor();
  });
  await check('Client navigation exposes a loading state while the portfolio request is pending', async () => {
    await navigate(page, '/solutions'); projectMode = 'delay'; await page.locator('.desktop-nav').getByRole('link', { name: 'Home', exact: true }).click();
    await page.getByText('Loading published projects…', { exact: true }).waitFor(); await page.getByText('No featured projects published yet', { exact: true }).waitFor(); projectMode = 'ready';
  });
  await check('Theme text and button tokens meet WCAG AA normal-text contrast', async () => {
    function luminance(hex) { const rgb = hex.replace('#', '').match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722; }
    function ratio(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
    for (const mode of ['light', 'dark']) {
      await page.evaluate(mode => localStorage.setItem('twinpeaks-theme', mode), mode); await page.reload(); await theme(page, mode);
      const tokens = await page.evaluate(() => { const style = getComputedStyle(document.documentElement); return Object.fromEntries(['background', 'surface', 'text', 'muted', 'accent', 'on-accent', 'section-tint', 'surface-raised', 'surface-quiet'].map(key => [key, style.getPropertyValue('--' + key).trim()])); });
      for (const background of ['background', 'surface', 'section-tint', 'surface-raised', 'surface-quiet']) for (const foreground of ['text', 'muted', 'accent']) assert(ratio(tokens[foreground], tokens[background]) >= 4.5, `${mode} ${foreground}/${background}`);
      assert(ratio(tokens['on-accent'], tokens.accent) >= 4.5, `${mode} button text`);
    }
  });
  await check('Routing preserves services, corporate pages and legal previews', async () => {
    await navigate(page, '/services'); await page.waitForURL('**/solutions'); await page.getByRole('heading', { name: 'Our Solutions', exact: true, level: 1 }).waitFor();
    for (const [route, heading] of [['/about', 'About TwinPeaks'], ['/contact', 'Contact Us'], ['/request-quote', 'Request a Quote']]) { await navigate(page, route); await page.getByRole('heading', { name: heading, level: 1, exact: true }).waitFor(); }
    for (const route of ['/privacy', '/terms']) { await navigate(page, route); await page.getByText('Legal copy awaiting approval', { exact: true }).waitFor(); }
    await navigate(page, '/404'); assert.equal((await fetch('http://127.0.0.1:18182/404')).status, 404);
  });
  await check('Published project response renders its detail link and handles a broken image', async () => {
    projectMode = 'populated'; await navigate(page); await page.getByRole('heading', { name: 'Synthetic QA project' }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'View project: Synthetic QA project' }).getAttribute('href'), '/projects/synthetic-qa');
    await page.getByText('Project image unavailable', { exact: true }).waitFor(); projectMode = 'ready';
  });
  await check('Private quotation headers, token-free metadata and PDF contract', async () => {
    const response = await fetch(`http://127.0.0.1:18182/quotations/${token}`); const html = await response.text(); assert(response.headers.get('cache-control').includes('no-store')); assert(response.headers.get('x-robots-tag').includes('noindex')); assert(!html.includes('Synthetic Customer'));
    await navigate(page, `/quotations/${token}`); await page.getByRole('heading', { name: 'QA-SYNTHETIC' }).waitFor();
    assert(!(await page.locator('link[rel="canonical"]').getAttribute('href')).includes(token)); assert(!(await page.locator('meta[property="og:url"]').getAttribute('content')).includes(token));
    const pdf = page.getByRole('link', { name: 'Download PDF' }); assert.equal(await pdf.getAttribute('referrerpolicy'), 'no-referrer'); assert((await pdf.getAttribute('href')).endsWith(`/quotations/public/${token}/pdf/`));
    assert.equal((await context.request.get(await pdf.getAttribute('href'))).headers()['content-type'], 'application/pdf');
  });
  await check('Existing quotation accept and decline workflows use synthetic records only', async () => {
    await page.getByRole('button', { name: 'Accept quotation', exact: true }).click(); await page.getByText('accepted', { exact: true }).waitFor();
    quotation = { ...quote }; await page.reload(); await page.getByLabel('Reason if declining (optional)').fill('Synthetic decline'); await page.getByRole('button', { name: 'Decline quotation', exact: true }).click(); await page.getByText('declined', { exact: true }).waitFor(); assert.equal(quotation.decline_reason, 'Synthetic decline');
  });
  await check('Keyboard skip link reaches the main landmark and reduced motion removes animation', async () => {
    await navigate(page); await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement?.className), 'skip-link'); await page.keyboard.press('Enter'); assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content');
    await page.emulateMedia({ reducedMotion: 'reduce' }); assert(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.button')).transitionDuration) <= 0.001));
  });
  await check('No third-party requests, private referrers or browser runtime exceptions', async () => {
    assert(browserRequests.every(url => ['http://127.0.0.1:18182', 'http://127.0.0.1:18181'].some(origin => url.startsWith(origin))), browserRequests.filter(url => !url.startsWith('http://127.0.0.1')));
    assert(apiRequests.filter(req => req.url.includes('/quotations/')).every(req => !req.referer)); assert.deepEqual(errors, []);
  });
  if (phase2) {
    await check('Phase 2 responsive light/dark screenshots for all four page types', async () => {
      const pages = [['solutions', '/solutions'], ['solution-detail', '/solutions/surveillance-alarm-systems'], ['projects', '/projects'], ['project-detail', '/projects/qa-security']];
      for (const mode of ['light', 'dark']) for (const [name, route] of pages) {
        await page.evaluate(mode => localStorage.setItem('twinpeaks-theme', mode), mode); await navigate(page, route); await theme(page, mode); await page.locator('h1').waitFor(); await page.waitForLoadState('networkidle');
        for (const width of [320, 375, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 1000 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}/${mode} overflow ${width}`); }
        await page.screenshot({ path: path.join(output, `phase2-${name}-${mode}.png`), fullPage: true }); await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, `phase2-${name}-${mode}-mobile.png`), fullPage: true });
      }
    });
    await check('All six solution routes and unknown solution 404', async () => {
      for (const slug of ['surveillance-alarm-systems', 'pos-supplies-solutions', 'it-support-maintenance', 'network-infrastructure', 'web-app-development', 'smart-security-solutions']) { const response = await fetch('http://127.0.0.1:18182/solutions/' + slug); assert.equal(response.status, 200); const html = await response.text(); assert(html.includes('page-breadcrumb-schema')); }
      const response = await fetch('http://127.0.0.1:18182/solutions/missing'); assert.equal(response.status, 404); assert((await response.text()).includes('noindex'));
    });
    await check('Service mapping, absence, availability errors and retry', async () => {
      await navigate(page, '/solutions/surveillance-alarm-systems'); await page.getByText('Development QA fixture — published service description from a synthetic API record.', { exact: true }).waitFor();
      await navigate(page, '/solutions/network-infrastructure'); await page.getByText('Tell us about your requirements.', { exact: false }).waitFor(); assert(!(await page.locator('main').textContent()).includes('matching service record'));
      serviceMode = 'error'; await navigate(page, '/solutions'); await page.reload(); await page.getByRole('heading', { name: 'Published service details unavailable' }).waitFor(); serviceMode = 'ready'; await page.locator('app-error-state').getByRole('button').click(); await page.getByText('Development QA fixture — published service description from a synthetic API record.', { exact: true }).waitFor();
    });
    await check('Category filtering and theme switching preserve data and filter selection', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 }); await navigate(page, '/projects'); await page.getByRole('button', { name: 'Security (2)', exact: true }).click(); await page.waitForFunction(() => document.querySelectorAll('app-project-card').length === 2); assert.equal(await page.locator('app-project-card').count(), 2);
      const before = apiRequests.filter(request => request.url === '/api/projects/').length; await page.locator('.desktop-theme .theme-toggle').click(); assert.equal(await page.getByRole('button', { name: 'Security (2)', exact: true }).getAttribute('aria-pressed'), 'true'); assert.equal(apiRequests.filter(request => request.url === '/api/projects/').length, before);
      await page.getByRole('button', { name: 'IT Infrastructure (1)', exact: true }).focus(); await page.keyboard.press('Enter'); await page.waitForFunction(() => document.querySelectorAll('app-project-card').length === 1); assert.equal(await page.locator('app-project-card').count(), 1);
    });
    await check('Project detail SSR metadata, breadcrumbs, 404 and unavailable recovery', async () => {
      const response = await fetch('http://127.0.0.1:18182/projects/qa-security'); assert.equal(response.status, 200); const html = await response.text(); assert(html.includes('Development QA fixture — Security planning')); assert(html.includes('page-breadcrumb-schema')); assert(!html.includes('Client Testimonial')); assert(!html.includes('Challenge'));
      assert.equal((await fetch('http://127.0.0.1:18182/projects/missing')).status, 404);
      await navigate(page, '/projects/qa-security'); assert((await page.title()).includes('Security planning')); assert((await page.locator('link[rel="canonical"]').getAttribute('href')).endsWith('/projects/qa-security')); assert.equal(await page.locator('time').textContent(), 'October 1, 2026');
      detailMode = 'error'; assert.equal((await fetch('http://127.0.0.1:18182/projects/qa-security')).status, 503); await navigate(page, '/projects/qa-security'); await page.getByRole('heading', { name: 'We couldn’t load this project' }).waitFor(); detailMode = 'ready'; await page.locator('app-error-state').getByRole('button').click(); await page.getByRole('heading', { name: 'Development QA fixture — Security planning', exact: true }).waitFor();
    });
    await check('Gallery keyboard controls and theme changes preserve selection', async () => {
      await page.getByRole('button', { name: 'Next project image' }).click(); await page.getByText('Image 2 of 2', { exact: true }).waitFor(); await page.locator('.desktop-theme .theme-toggle').click(); await page.getByText('Image 2 of 2', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Previous project image' }).focus(); await page.keyboard.press('ArrowLeft'); await page.getByText('Image 1 of 2', { exact: true }).waitFor(); assert.equal(await page.getByRole('button', { name: 'Previous project image' }).isDisabled(), true);
    });
    await check('Project detail navigation announces pending data before loading the next record', async () => {
      await navigate(page, '/projects'); detailMode = 'delay'; await page.getByRole('link', { name: 'View project: Development QA fixture — Security planning', exact: true }).click();
      await page.getByText('Loading page…', { exact: true }).waitFor(); await page.getByRole('heading', { name: 'Development QA fixture — Security planning', exact: true }).waitFor(); detailMode = 'ready';
    });
    await check('Contextual CTAs preserve request intent without submitting forms', async () => {
      const similar = page.getByRole('link', { name: 'Request a Similar Solution', exact: true }).first(); assert((await similar.getAttribute('href')).includes('project=qa-security')); await similar.click(); await page.getByRole('heading', { name: 'Request a Quote', exact: true, level: 1 }).waitFor();
      await navigate(page, '/solutions/surveillance-alarm-systems'); assert((await page.getByRole('link', { name: 'Request a Site Assessment', exact: true }).first().getAttribute('href')).includes('enquiry=site-assessment'));
    });
    await check('Portfolio errors and empty state remain honest and recoverable', async () => {
      portfolioMode = 'error'; await navigate(page, '/projects'); await page.getByRole('heading', { name: 'Projects are temporarily unavailable' }).waitFor(); portfolioMode = 'empty'; await page.locator('app-error-state').getByRole('button').click(); await page.getByRole('heading', { name: 'No projects to show' }).waitFor(); portfolioMode = 'ready';
    });
    await check('Phase 2 has no hydration/runtime exceptions or non-local network requests', async () => { assert.deepEqual(errors, []); assert(browserRequests.every(url => url.startsWith('http://127.0.0.1:'))); });
  }
  if (phase3) await require('./phase3-checks.cjs')({ page, check, navigate, theme, leads, errors, browserRequests, apiRequests, output });
  if (phase4) await require('./phase4-checks.cjs')({ page, check, navigate, theme, leads, errors, browserRequests, output, resetQuote: () => { quotation = { ...quote }; decisionMode = 'ready'; }, setDecisionMode: mode => { decisionMode = mode; } });
  fs.writeFileSync(path.join(output, phase4 ? 'phase4-browser-results.json' : phase3 ? 'phase3-browser-results.json' : phase2 ? 'phase2-browser-results.json' : 'browser-results.json'), JSON.stringify({ failures, browserErrors: errors, widths: [320, 375, 390, 768, 1024, 1440], apiRequests, browserRequests }, null, 2));
  fs.writeFileSync(path.join(output, 'ssr.log'), serverLog);
  process.exitCode = failures.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); app?.kill(); api.close(); });

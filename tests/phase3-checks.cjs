// All POSTs go to the synthetic loopback API. Payloads are asserted in memory only.
const assert = require('node:assert/strict');
const path = require('node:path');
module.exports = async ({ page, check, navigate, theme, leads, errors, browserRequests, apiRequests, output }) => {
  async function fillContact() {
    await page.getByLabel('Full name', { exact: false }).fill('Synthetic QA Customer'); await page.getByLabel('Email address', { exact: false }).fill('qa@example.invalid'); await page.getByLabel('Phone number', { exact: false }).fill('+268 7600 0000'); await page.getByLabel('Message', { exact: false }).fill('Synthetic contact test. Not a real customer enquiry.'); await page.getByLabel('I agree to be contacted').check();
  }
  async function fillQuote() {
    await page.getByLabel('Full name', { exact: false }).fill('Synthetic QA Customer'); await page.getByLabel('Email address', { exact: false }).fill('qa@example.invalid'); await page.getByLabel('Phone number', { exact: false }).fill('+268 7600 0000'); await page.locator('.category-choice input').first().check(); await page.getByLabel('Project description', { exact: false }).fill('Synthetic quotation test. Not a real customer request.'); await page.getByLabel('Project location', { exact: false }).fill('QA area'); await page.getByLabel('I agree to be contacted').check();
  }
  await check('Phase 3 public SSR includes SEO, blank forms and protected form document headers', async () => {
    for (const route of ['/about', '/contact', '/request-quote']) {
      const response = await fetch('http://127.0.0.1:18182' + route); const html = await response.text(); assert(response.ok); assert(html.includes('<h1>')); assert(html.includes('rel="canonical"')); assert(html.includes('page-breadcrumb-schema')); assert(!html.includes('qa@example.invalid')); assert(!html.includes('Synthetic QA Customer')); if (route !== '/about') assert(response.headers.get('cache-control').includes('no-store'));
    }
    for (const route of ['/privacy', '/terms']) { const html = await (await fetch('http://127.0.0.1:18182' + route)).text(); assert(html.includes('noindex')); assert(html.includes('Legal copy awaiting approval')); }
  });
  await check('About, Contact and Quote light/dark screenshots and six responsive widths', async () => {
    for (const mode of ['light', 'dark']) for (const [name, route] of [['about','/about'], ['contact','/contact'], ['request-quote','/request-quote']]) {
      await navigate(page, route); await page.evaluate(mode => localStorage.setItem('twinpeaks-theme', mode), mode); await page.reload(); await theme(page, mode); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => { for (const img of document.images) img.loading = 'eager'; }); await page.waitForFunction(() => [...document.images].every(img => img.complete));
      for (const width of [320,375,390,768,1024,1440]) { await page.setViewportSize({width,height:1000}); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} ${mode} overflow ${width}`); }
      await page.screenshot({ path: path.join(output, `phase3-${name}-${mode}.png`), fullPage: true }); await page.setViewportSize({width:390,height:844}); await page.screenshot({ path: path.join(output, `phase3-${name}-${mode}-mobile.png`), fullPage: true });
      assert.equal(await page.locator('h1').count(),1);
    }
    await page.setViewportSize({width:1440,height:1000});
  });
  await check('Contact validates, supports accessible labels and confirms a single compatible submission', async () => {
    await navigate(page, '/contact'); const count = leads.contactCount; await page.getByRole('button', {name:'Send Message',exact:true}).click(); await page.getByText('Please review the highlighted fields.', {exact:true}).waitFor(); assert.equal(leads.contactCount,count);
    await fillContact(); await page.getByLabel('Full name', {exact:false}).focus(); await page.keyboard.press('Tab'); assert(await page.getByLabel('Email address', {exact:false}).evaluate(el=>el===document.activeElement));
    leads.contactMode='delay'; await page.getByRole('button',{name:'Send Message',exact:true}).click(); await page.getByRole('button',{name:'Sending…',exact:true}).waitFor(); assert(await page.getByRole('button',{name:'Sending…',exact:true}).isDisabled()); assert(await page.getByLabel('Full name',{exact:false}).isDisabled());
    await page.getByRole('heading',{name:'Your enquiry has been received.'}).waitFor(); assert.equal(leads.contactCount,count+1); assert.deepEqual(Object.keys(leads.contactBody).sort(),['email','message','name']); assert(leads.contactBody.message.includes('26876000000')); leads.contactMode='ready';
    assert.equal(await page.evaluate(()=>localStorage.length),1); assert(!page.url().includes('qa@example')); assert(!(await page.locator('head').textContent()).includes('Synthetic QA Customer'));
  });
  await check('Contact preserves values on server validation and ambiguous failure, with no automatic retry', async () => {
    leads.contactMode='invalid'; await navigate(page,'/contact'); await fillContact(); await page.getByRole('button',{name:'Send Message',exact:true}).click(); await page.getByText('The server rejected this field.',{exact:false}).waitFor(); assert.equal(await page.getByLabel('Full name',{exact:false}).inputValue(),'Synthetic QA Customer');
    await page.getByLabel('Email address',{exact:false}).fill('qa-retry@example.invalid'); leads.contactMode='error'; const count=leads.contactCount; await page.getByRole('button',{name:'Send Message',exact:true}).click(); await page.getByText('We could not confirm the outcome.',{exact:false}).waitFor(); assert(await page.getByRole('button',{name:'Send Message',exact:true}).isDisabled()); assert.equal(leads.contactCount,count+1);
    leads.contactMode='ready'; await page.getByLabel('I have checked the outcome').check(); await page.getByRole('button',{name:'Send Message',exact:true}).click(); await page.getByRole('heading',{name:'Your enquiry has been received.'}).waitFor(); assert.equal(leads.contactCount,count+2);
  });
  await check('Contact throttling, malformed response and network loss never claim success', async () => {
    for (const mode of ['throttle','malformed','timeout']) {
      leads.contactMode=mode; await navigate(page,'/contact'); await fillContact(); await page.getByRole('button',{name:'Send Message',exact:true}).click(); await page.locator('.submission-feedback').waitFor(); assert.equal(await page.getByRole('heading',{name:'Your enquiry has been received.'}).count(),0); assert(await page.getByRole('button',{name:'Send Message',exact:true}).isDisabled());
      if(mode==='throttle') { await page.waitForFunction(()=>!document.querySelector('.form-submit').disabled); } else assert(await page.getByLabel('I have checked the outcome').isVisible());
    } leads.contactMode='ready';
  });
  await check('Quotation context is validated, safely preselected and never fills customer identity', async () => {
    await navigate(page,'/request-quote?solution=web-app-development&enquiry=site-assessment&project=qa-security'); await page.getByText('Project reference: Development QA fixture — Security planning',{exact:true}).waitFor(); assert(await page.locator('.category-choice input').nth(4).isChecked()); assert.equal(await page.getByLabel('Full name',{exact:false}).inputValue(),'');
    const count=apiRequests.length; await navigate(page,'/request-quote?solution=unknown&project=..%2Fprivate&name=ignored'); assert.equal(await page.locator('.category-choice input:checked').count(),0); assert.equal(await page.getByLabel('Full name',{exact:false}).inputValue(),''); assert(!apiRequests.slice(count).some(request=>request.url.includes('/private')));
  });
  await check('Quotation review, business validation, multiselect contract and confirmed single submission', async () => {
    await navigate(page,'/request-quote'); const count=leads.quoteCount; await page.getByRole('button',{name:'Review Request',exact:true}).click(); await page.getByText('Please review the highlighted fields.',{exact:true}).waitFor(); assert.equal(leads.quoteCount,count);
    await fillQuote(); await page.getByLabel('Customer type').selectOption('business'); await page.getByRole('button',{name:'Review Request',exact:true}).click(); assert.equal(await page.getByRole('button',{name:'Submit Request',exact:true}).count(),0); await page.getByLabel('Company / organization',{exact:false}).fill('Synthetic QA organization'); await page.locator('.category-choice input').nth(4).check();
    await page.getByLabel('Budget range',{exact:false}).fill('QA budget'); await page.getByRole('button',{name:'Review Request',exact:true}).click(); await page.getByRole('heading',{name:'Review Your Request',exact:true}).waitFor(); assert((await page.locator('.review-summary').textContent()).includes('Synthetic QA organization')); assert.equal(leads.quoteCount,count);
    leads.quoteMode='delay'; await page.getByRole('button',{name:'Submit Request',exact:true}).click(); await page.getByRole('button',{name:'Submitting…',exact:true}).waitFor(); assert(await page.getByRole('button',{name:'Submitting…',exact:true}).isDisabled()); await page.getByRole('heading',{name:'Your quotation request has been received.'}).waitFor(); assert.equal(leads.quoteCount,count+1); assert.equal(leads.quoteBody.items.length,2); assert(leads.quoteBody.items.every(item=>item.description && !item.service_id)); assert.equal(leads.quoteBody.phone_number,'26876000000'); assert.deepEqual(Object.keys(leads.quoteBody).sort(),['address','company_name','email','items','message','name','phone_number']); assert(!(await page.locator('main').textContent()).includes('11111111-1111')); leads.quoteMode='ready';
  });
  await check('Quotation validation and uncertain retries retain customer input through edit/review', async () => {
    leads.quoteMode='invalid'; await navigate(page,'/request-quote'); await fillQuote(); await page.getByRole('button',{name:'Review Request',exact:true}).click(); await page.getByRole('button',{name:'Submit Request',exact:true}).click(); await page.getByText('The server rejected this field.',{exact:false}).waitFor(); await page.getByLabel('Phone number',{exact:false}).fill('+268 7600 0001');
    await page.getByRole('button',{name:'Review Request',exact:true}).click(); leads.quoteMode='error'; const count=leads.quoteCount; await page.getByRole('button',{name:'Submit Request',exact:true}).click(); await page.getByText('We could not confirm the outcome.',{exact:false}).waitFor(); assert(await page.getByRole('button',{name:'Submit Request',exact:true}).isDisabled()); await page.getByRole('button',{name:'Edit Request',exact:true}).click(); assert.equal(await page.getByLabel('Full name',{exact:false}).inputValue(),'Synthetic QA Customer'); await page.getByRole('button',{name:'Review Request',exact:true}).click(); assert(await page.getByRole('button',{name:'Submit Request',exact:true}).isDisabled()); assert.equal(leads.quoteCount,count+1);
    leads.quoteMode='ready'; await page.getByLabel('I have checked the outcome').check(); await page.getByRole('button',{name:'Submit Request',exact:true}).click(); await page.getByRole('heading',{name:'Your quotation request has been received.'}).waitFor(); assert.equal(leads.quoteCount,count+2);
  });
  await check('Phase 3 runtime privacy, hydration and loopback-only QA submissions',async()=>{ assert.deepEqual(errors,[]); assert(browserRequests.every(url=>url.startsWith('http://127.0.0.1:'))); assert(apiRequests.filter(request=>request.method==='POST').every(request=>request.referer==='')); });
};

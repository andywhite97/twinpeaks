const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
module.exports = async ({ page, check, navigate, theme, errors, output, resetQuote, setDecisionMode }) => {
  const base='http://127.0.0.1:18182';
  resetQuote();
  await check('Phase 4 unknown URLs retain path, HTTP 404 and noindex; public aliases use 301',async()=>{
    for(const route of ['/unmatched-phase4','/__proto__','/constructor']) {
      const response=await fetch(base+route); assert.equal(response.status,404); const html=await response.text(); assert(html.includes('Page Not Found')); assert(html.includes('noindex')); assert(html.includes(base+route));
    }
    for(const [from,to] of [['/services','/solutions'],['/gallery','/projects'],['/leadership','/about']]) { const response=await fetch(base+from,{redirect:'manual'}); assert.equal(response.status,301); assert.equal(response.headers.get('location'),to); }
    await navigate(page,'/unmatched-phase4'); await page.getByRole('heading',{name:'Page not found',level:1,exact:true}).waitFor(); assert(page.url().endsWith('/unmatched-phase4'));
  });
  await check('Phase 4 hosting headers, immutable fingerprints and conservative stable-asset caching',async()=>{
    await navigate(page); const script=await page.locator('script[src]').first().getAttribute('src');
    for(const route of ['/','/contact','/request-quote','/unmatched-phase4','/assets/brand/icon_only.png','/'+script.replace(/^\//,'')]) {
      const response=await fetch(base+route); assert.equal(response.headers.get('x-content-type-options'),'nosniff'); assert.equal(response.headers.get('x-frame-options'),'DENY'); assert(response.headers.get('content-security-policy').includes("frame-ancestors 'none'")); assert.equal(response.headers.get('referrer-policy'),'no-referrer');
      if(route==='/contact'||route==='/request-quote') assert(response.headers.get('cache-control').includes('no-store'));
    }
    const hashed=await fetch(base+'/'+script.replace(/^\//,'')); assert(hashed.headers.get('cache-control').includes('immutable'));
    const stable=await fetch(base+'/assets/brand/icon_only.png'); assert(!stable.headers.get('cache-control').includes('immutable')); assert.equal(stable.headers.get('cache-control'),'public, max-age=3600, must-revalidate');
    const invalidHost=await new Promise((resolve,reject)=>{const req=http.get(base+'/assets/brand/icon_only.png',{headers:{Host:'evil.example'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});req.on('error',reject);}); assert.equal(invalidHost,400);
    assert.equal((await fetch(base+'/assets/images/technology-concept.png')).status,404);
  });
  await check('Phase 4 precompressed assets negotiate safely and decode to identical content',async()=>{
    await navigate(page); const script=await page.locator('script[src]').first().getAttribute('src'); const url=base+'/'+script.replace(/^\//,'');
    const plain=await fetch(url,{headers:{'Accept-Encoding':'identity'}});const body=await plain.text();assert.equal(plain.headers.get('content-encoding'),null);
    for(const [requested,expected] of [['br','br'],['gzip','gzip'],['br;q=0,gzip;q=1','gzip']]){const response=await fetch(url,{headers:{'Accept-Encoding':requested}});assert.equal(response.headers.get('content-encoding'),expected);assert.equal(await response.text(),body);assert.equal(response.headers.get('vary'),'Accept-Encoding');assert(Number(response.headers.get('content-length'))<Number(plain.headers.get('content-length')));}
  });
  const audits=[];
  await check('Phase 4 custom accessibility checks cover landmarks, labels, image alternatives and form control contrast',async()=>{
    const routes=['/','/solutions','/solutions/surveillance-alarm-systems','/projects','/projects/qa-security','/about','/contact','/request-quote','/quotations/11111111-1111-4111-8111-111111111111'];
    for(const mode of ['light','dark']) for(const route of routes) {
      await navigate(page,route); await page.evaluate(mode=>localStorage.setItem('twinpeaks-theme',mode),mode); await page.reload(); await theme(page,mode); await page.waitForLoadState('networkidle');
      const result=await page.evaluate(()=>{
        const visible=el=>!!(el.getClientRects().length && getComputedStyle(el).visibility!=='hidden');
        const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);
        const inputs=[...document.querySelectorAll('main input,main select,main textarea')].filter(visible);
        const missingLabels=inputs.filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')).map(el=>el.tagName);
        const missingDescriptions=inputs.flatMap(el=>(el.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&!document.getElementById(id)));
        const rgb=c=>c.match(/[\d.]+/g).slice(0,3).map(Number), lum=c=>{const v=rgb(c).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}, ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
        const borders=[...document.querySelectorAll('.form-field input,.form-field select,.form-field textarea')].map(el=>{const s=getComputedStyle(el);return ratio(s.borderTopColor,s.backgroundColor);});
        const smallTargets=[...document.querySelectorAll('main button,main a,header a,header button,footer a')].filter(visible).filter(el=>{const r=el.getBoundingClientRect();return r.width<24||r.height<24;}).map(el=>el.textContent.trim().slice(0,50));
        return{main:document.querySelectorAll('main').length,h1:document.querySelectorAll('h1').length,lang:document.documentElement.lang,duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),missingLabels,missingDescriptions,missingAlt:[...document.querySelectorAll('img')].filter(el=>!el.hasAttribute('alt')).length,borders,smallTargets};
      });
      audits.push({route,mode,...result}); assert.equal(result.main,1); assert.equal(result.h1,1); assert.equal(result.lang,'en'); assert.deepEqual(result.duplicateIds,[]); assert.deepEqual(result.missingLabels,[]); assert.deepEqual(result.missingDescriptions,[]); assert.equal(result.missingAlt,0); assert(result.borders.every(ratio=>ratio>=3));
    }
    fs.writeFileSync(path.join(output,'phase4-custom-accessibility.json'),JSON.stringify({tool:'Custom DOM/computed-style checks; not axe, not WCAG certification',audits},null,2));
  });
  await check('Phase 4 form keyboard focus is visible and logical through validation, review and edit',async()=>{
    await navigate(page,'/contact'); await page.getByRole('button',{name:'Send Message',exact:true}).click(); await page.waitForFunction(()=>document.activeElement?.id==='contact-name');
    await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.id),'contact-email');
    const focus=await page.getByLabel('Email address',{exact:false}).evaluate(el=>{const s=getComputedStyle(el);return{style:s.outlineStyle,width:s.outlineWidth};}); assert.notEqual(focus.style,'none'); assert(parseFloat(focus.width)>=2);
    await navigate(page,'/request-quote'); await page.getByLabel('Full name',{exact:false}).fill('Synthetic QA'); await page.getByLabel('Email address',{exact:false}).fill('qa@example.invalid'); await page.getByLabel('Phone number',{exact:false}).fill('26876000000'); await page.locator('.category-choice input').first().check(); await page.getByLabel('Project description',{exact:false}).fill('Synthetic QA description for focus checks.'); await page.getByLabel('Project location',{exact:false}).fill('QA area'); await page.getByLabel('I agree to be contacted').check(); await page.getByRole('button',{name:'Review Request',exact:true}).click(); await page.waitForFunction(()=>document.activeElement?.textContent==='Review Your Request'); await page.getByRole('button',{name:'Edit Request',exact:true}).click(); await page.waitForFunction(()=>document.activeElement?.id==='quote-name');
  });
  await check('Phase 4 private decisions require status reload after uncertain or mismatched responses',async()=>{
    for(const mode of ['error','malformed']) {
      resetQuote(); setDecisionMode(mode); await navigate(page,'/quotations/11111111-1111-4111-8111-111111111111'); await page.getByRole('button',{name:'Accept quotation',exact:true}).click(); await page.getByRole('button',{name:'Reload quotation status',exact:true}).waitFor(); assert.equal(await page.getByRole('button',{name:'Accept quotation',exact:true}).count(),0); assert(!(await page.locator('main').textContent()).includes('Quotation accepted.'));
      setDecisionMode('ready'); await page.getByRole('button',{name:'Reload quotation status',exact:true}).click(); await page.getByRole('button',{name:'Accept quotation',exact:true}).waitFor();
    }
  });
  await check('Phase 4 no hydration/runtime regressions after hardening',async()=>assert.deepEqual(errors,[]));
};

// Optimized loopback build, actual LOCAL public APIs. No contact/quote/payment writes.
const { chromium }=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results','phase4');fs.mkdirSync(out,{recursive:true});
let app,browser;const errors=[],requests=[],metrics=[],layouts=[];let serverLog='';
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{app?.kill();process.exit(130);});
(async()=>{
  app=spawn(process.execPath,['dist/front-v2/server/server.mjs'],{cwd:root,env:{...process.env,PORT:'18184'},stdio:['ignore','pipe','pipe']});app.stdout.on('data',c=>serverLog+=c);app.stderr.on('data',c=>serverLog+=c);
  let ready=false;for(let i=0;i<80;i++){if(app.exitCode!==null)throw Error('SSR process failed');try{if((await fetch('http://127.0.0.1:18184/',{signal:AbortSignal.timeout(1000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready);
  const evidence=JSON.parse(fs.readFileSync(path.join(root,'test-results','phase4-content-and-live-url-evidence.json'),'utf8'));
  const projects=evidence.find(item=>item.url==='http://127.0.0.1:8000/api/projects/')?.body||[];
  const categories=['surveillance-alarm-systems','pos-supplies-solutions','it-support-maintenance','network-infrastructure','web-app-development','smart-security-solutions'];
  const routes=['/','/solutions',...categories.map(slug=>'/solutions/'+slug),'/projects',...projects.filter(p=>/^[\w-]{1,140}$/.test(p.slug)).slice(0,2).map(p=>'/projects/'+p.slug),'/about','/contact','/request-quote'];
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await context.route('**/*',route=>{const req=route.request();requests.push({method:req.method(),url:req.url()});if(req.method()!=='GET'||!req.url().startsWith('http://127.0.0.1:'))return route.abort();return route.continue();});
  for(const mode of ['light','dark'])for(const route of routes){
    await page.goto('http://127.0.0.1:18184');await page.evaluate(mode=>localStorage.setItem('twinpeaks-theme',mode),mode);const response=await page.goto('http://127.0.0.1:18184'+route);assert.equal(response.status(),200);await page.waitForLoadState('networkidle');await page.waitForFunction(mode=>document.documentElement.dataset.theme===mode,mode);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('input[type=email]').evaluateAll(inputs=>inputs.every(input=>input.value==='')),true);
    for(const width of [320,375,390,768,1024,1440]){await page.setViewportSize({width,height:1000});const ok=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);layouts.push({mode,route,width,ok});assert(ok,`overflow ${mode} ${route} ${width}`);}
    if(['/','/contact','/request-quote','/projects'].includes(route)){await page.evaluate(()=>{for(const img of document.images)img.loading='eager';});await page.waitForFunction(()=>[...document.images].every(img=>img.complete));const name=route==='/'?'homepage':route.slice(1);await page.screenshot({path:path.join(out,`local-${name}-${mode}.png`),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,`local-${name}-${mode}-mobile.png`),fullPage:true});}
  }
  await context.close();
  for(const mobile of [false,true])for(let run=1;run<=3;run++){
    const sample=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},colorScheme:'light'});const p=await sample.newPage();p.on('pageerror',e=>errors.push(String(e)));
    await sample.route('**/*',route=>{const req=route.request();requests.push({method:req.method(),url:req.url()});return req.method()==='GET'&&req.url().startsWith('http://127.0.0.1:')?route.continue():route.abort();});
    await p.addInitScript(()=>{window.__readiness={lcp:null,cls:0,longTaskMs:0};new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__readiness.lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__readiness.cls+=entry.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__readiness.longTaskMs+=entry.duration;}).observe({type:'longtask',buffered:true});});
    const cdp=await sample.newCDPSession(p);if(mobile){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});}
    await p.goto('http://127.0.0.1:18184/');await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
    const data=await p.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0];const resources=performance.getEntriesByType('resource');return{...window.__readiness,ttfbMs:nav.responseStart-nav.requestStart,fcpMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,domContentLoadedMs:nav.domContentLoadedEventEnd,resourceTransferBytes:resources.reduce((sum,r)=>sum+r.transferSize,0),resources:resources.map(r=>({name:r.name,encodedBodySize:r.encodedBodySize,transferSize:r.transferSize,initiator:r.initiatorType})),selectedHero:document.querySelector('.hero-visual img')?.currentSrc};});
    metrics.push({mobile,run,viewport:mobile?'390x844':'1440x1000',cpuRate:mobile?4:1,network:mobile?'150ms latency; 1.6Mbps down; 750kbps up':'Loopback, unthrottled',browserCache:'new context (cold browser); warm server/OS/backend caches',...data});await sample.close();
  }
  assert.deepEqual(errors,[]);assert(requests.every(r=>r.method==='GET'&&r.url.startsWith('http://127.0.0.1:')));
  fs.writeFileSync(path.join(out,'local-readonly-and-performance.json'),JSON.stringify({environment:'Angular production optimizations; development API on localhost; Windows/Edge headless; lab measurements, not Lighthouse or field Core Web Vitals',routes,layouts,metrics,errors,requests},null,2));console.log(`PASS ${routes.length} actual-local public routes; ${layouts.length} theme/width checks; 6 cold-browser homepage lab samples; GET only; no runtime errors`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();app?.kill();fs.writeFileSync(path.join(out,'local-ssr.log'),serverLog);});

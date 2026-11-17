'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),live=process.argv.includes('--live');
const output=process.env.SPORTS_REPORT_DIR||'/tmp/sports-center-results';fs.mkdirSync(output,{recursive:true});
const report={mode:live?'production':'candidate',at:new Date().toISOString(),dashboards:[],errors:[],directESPN:[],relayFailures:[]};
let browser;
(async()=>{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1920,height:1080},timezoneId:'America/New_York'});
 const garageRoot=process.env.GARAGE_ROOT;
 if(!live){
  assert.ok(garageRoot,'Garage candidate checkout required');
  for(const [repo,dir,html]of [['Chris-basement',root,'index-v3822.html'],['Jim-Amys-Garage',garageRoot,'index.html']]){
   await context.route('**/'+repo+'/sports-feed.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(dir,'sports-feed.js'),'utf8')}));
   await context.route(repo==='Chris-basement'?'**/Chris-basement/index-v3822.html*':'**/Jim-Amys-Garage/?*',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(dir,html),'utf8')}));
  }
 }
 for(const [name,url,html,dir]of [['Chris','https://nubulator.github.io/Chris-basement/index-v3822.html','index-v3822.html',root],['Garage','https://nubulator.github.io/Jim-Amys-Garage/','index.html',garageRoot]]){
  const p=await context.newPage(),responses=[],pending=[];
  p.on('pageerror',e=>report.errors.push({name,error:String(e)}));
  p.on('request',r=>{if(r.url().startsWith('https://site.api.espn.com/apis/site/v2/sports/'))report.directESPN.push(r.url())});
  p.on('requestfailed',r=>{if(r.url().includes('/api/sports?'))report.relayFailures.push({name,url:r.url(),error:r.failure()?.errorText})});
  p.on('response',r=>{if(r.url().includes('/api/sports?'))pending.push((async()=>{
   if(!r.ok()){report.relayFailures.push({name,url:r.url(),status:r.status(),body:(await r.text()).slice(0,150)});return}
   responses.push({url:r.url(),fetchedAt:r.headers()['x-sports-fetched-at'],data:await r.json()});
  })().catch(e=>report.relayFailures.push({name,error:String(e)})))});
  if(live){
   // Poll published files before opening the browser; no network interception.
   for(let i=0;i<12;i++){
    const r=await context.request.get(url+'?verify-source='+Date.now());
    if(r.ok()&&(await r.text())===fs.readFileSync(path.join(dir,html),'utf8'))break;
    assert.ok(i<11,name+' production HTML must match verified source');await new Promise(r=>setTimeout(r,5000));
   }
   const js=await context.request.get(new URL('sports-feed.js?verify='+Date.now(),url).href);
   assert.equal(await js.text(),fs.readFileSync(path.join(dir,'sports-feed.js'),'utf8'),name+' production transport');
  }
  await p.goto(url+'?sports-verification='+Date.now(),{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('SCORES CONNECTED'),{},{timeout:90000});
  await p.waitForFunction(()=>myTeams.length>=5&&myTeams.every(g=>g.id&&g.awayRecord&&g.homeRecord),{},{timeout:90000});
  await Promise.all(pending);
  const state=await p.evaluate(()=>({games,myTeams,status:document.getElementById('status').innerText}));
  assert.ok(state.games.length>0,name+' sports games populated');
  assert.ok(responses.length>10,name+' real relay responses');
  let verified=0;
  for(const g of state.games){
   const e=responses.filter(r=>new URL(r.url).searchParams.get('path').endsWith('/scoreboard')).flatMap(r=>r.data.events||[]).find(e=>String(e.id)===g.id);
   assert.ok(e,'scoreboard source for '+g.id);
   const competitors=e.competitions[0].competitors;
   for(const side of ['away','home'])assert.equal(String(g[side==='away'?'as':'hs']),String(competitors.find(c=>c.homeAway===side).score??''));
   assert.equal(g.live,e.status.type.state==='in');assert.equal(g.final,e.status.type.state==='post');verified++;
  }
  await p.locator('[data-league="ALL"]').click();
  assert.doesNotMatch(await p.locator('#games').innerText(),/Schedule unavailable|Loading live games/);
  const filters=[];
  for(const league of ['NFL','NCAA FOOTBALL','NCAA MEN','NBA','NHL','MLB']){
   await p.locator('[data-league="'+league+'"]').click();
   assert.equal(await p.evaluate(()=>leagueFilter),league);
   const metas=await p.locator('#games .game .meta').allTextContents();
   assert.ok(metas.every(t=>t.includes(league)),name+' league cards '+league);filters.push({league,cards:metas.length});
  }
  await p.locator('[data-league="ALL"]').click();
  await p.waitForFunction(()=>/\d+°/.test(document.getElementById('weather').innerText),{},{timeout:30000});
  const before=await p.locator('#fun-counter').innerText();await p.locator('#fun-next').click();assert.notEqual(await p.locator('#fun-counter').innerText(),before);
  await p.screenshot({path:path.join(output,name.toLowerCase()+'-home.png')});
  const firstScoreTime=Math.max(...responses.filter(r=>new URL(r.url).searchParams.get('path').endsWith('/scoreboard')).map(r=>Date.parse(r.fetchedAt)));
  // Verify automatic score polling moves past the relay's 30-second cache.
  await p.waitForTimeout(35000);await Promise.all(pending);
  const latestScoreTime=Math.max(...responses.filter(r=>new URL(r.url).searchParams.get('path').endsWith('/scoreboard')).map(r=>Date.parse(r.fetchedAt)));
  assert.ok(latestScoreTime>firstScoreTime,name+' automatic refresh gets newer ESPN source');
  assert.ok(Date.now()-latestScoreTime<60000,name+' recent scoreboard source');
  report.dashboards.push({name,status:state.status,verifiedScores:verified,favorites:state.myTeams.map(g=>({id:g.id,team:g.league,match:g.away+' at '+g.home,awayRecord:g.awayRecord,homeRecord:g.homeRecord,odds:g.odds})),filters,weather:await p.locator('#weather').innerText(),firstScoreTime:new Date(firstScoreTime).toISOString(),latestScoreTime:new Date(latestScoreTime).toISOString(),relayResponses:responses.length});
  await p.close();
 }
 assert.deepEqual(report.directESPN,[],'no browser-to-ESPN sports requests');
 assert.deepEqual(report.relayFailures,[],'all sports relay requests succeed');
 assert.deepEqual(report.errors,[],'no uncaught JavaScript errors');report.passed=true;
})().catch(e=>{report.passed=false;report.failure=String(e.stack||e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();fs.writeFileSync(path.join(output,'sports-center-'+(live?'live':'candidate')+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))});

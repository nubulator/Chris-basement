const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function client(fetch = async () => new Response('{}')) {
  const window = {fetch, location: {href: 'https://nubulator.github.io/Chris-basement/index-v3822.html'}};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../sports-feed.js'), 'utf8'), {window, URL, AbortSignal});
  return window.IsonSports;
}
test('ESPN transport preserves endpoint/query, omits credentials and exposes source freshness', async () => {
  let request; const signal = new AbortController().signal;
  const api = client(async (...args) => {request = args; return new Response('{}', {headers: {'X-Sports-Fetched-At': '2026-11-17T01:00:00Z'}});});
  await api.fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20261116&limit=300', {signal, cache:'no-store'});
  const url = new URL(request[0]);
  assert.equal(url.origin, 'https://bernie-bernie-family-card-night.nubulator.chatgpt.site');
  assert.equal(url.pathname, '/api/sports');
  assert.equal(url.searchParams.get('path'), 'football/nfl/scoreboard');
  assert.equal(url.searchParams.get('dates'), '20261116');
  assert.equal(request[1].credentials, 'omit');
  assert.equal(request[1].signal, signal);
  assert.equal(api.lastFetchedAt, '2026-11-17T01:00:00Z');
});
test('weather, game data and unrelated requests retain their original transport', async () => {
  const requests=[];const api=client(async (...args)=>{requests.push(args);return new Response('{}')});
  for(const url of ['https://api.open-meteo.com/v1/forecast','./data/daily-line-feed.json','https://example.com/apis/site/v2/sports/football/nfl/scoreboard'])await api.fetch(url,{cache:'no-store'});
  assert.deepEqual(requests.map(r=>r[0]), ['https://api.open-meteo.com/v1/forecast','./data/daily-line-feed.json','https://example.com/apis/site/v2/sports/football/nfl/scoreboard']);
});
test('real spreads, totals and pick em are distinct from moneylines and missing values', () => {
  const api=client(), event=odds=>({competitions:[{competitors:[{homeAway:'home',team:{abbreviation:'CBJ'}}],odds:[odds]}]});
  assert.equal(api.publishedOdds(event({details:'CBJ -155',spread:1.5,overUnder:6.5}),'NHL'),'LINE: CBJ +1.5 • O/U: 6.5');
  assert.equal(api.publishedOdds(event({details:'CBJ -155',pointSpread:{home:{close:{line:'-1.5'}}},total:{over:{close:{line:'o6.5'}}}}),'NHL'),'LINE: CBJ -1.5 • O/U: 6.5');
  assert.equal(api.publishedOdds(event({spread:0,overUnder:44}),'NFL'),'LINE: CBJ +0 • O/U: 44');
  assert.equal(api.publishedOdds(event({details:'CLE -3.5',overUnder:44.5}),'NFL'),'LINE: CLE -3.5 • O/U: 44.5');
  assert.equal(api.publishedOdds(event({details:'Pending',overUnder:0}),'NFL'),'');
  assert.equal(api.publishedOdds(event({details:'CBJ -155'}),'NHL'),'');
});

'use strict';
// Candidate mode intercepts ONLY the PR's HTML/cache at the real Pages URLs.
// --live makes no route overrides: it verifies the deployed production files.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const chris = 'https://nubulator.github.io/Chris-basement/';
const garage = 'https://nubulator.github.io/Jim-Amys-Garage/';
const output = process.env.DAILY_LINE_REPORT_DIR || path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
const report = { mode: live ? 'production' : 'candidate', at: new Date().toISOString(), checks: [], errors: [], requestsFailed: [] };
let browser;
(async () => {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, timezoneId: 'America/New_York' });
  let feed = JSON.parse(fs.readFileSync(path.join(root, 'data/daily-line-feed.json')));
  if (live) {
    // GitHub Pages edges can take a short time to serve a newly deployed file.
    for (let attempt = 0; attempt < 12; attempt++) {
      const response = await context.request.get(chris + 'data/daily-line-feed.json?verify=' + Date.now());
      if (response.ok()) { feed = await response.json(); break; }
      if (attempt === 11) throw Error('Production cache HTTP ' + response.status());
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } else {
    await context.route('**/Chris-basement/index-v3822.html*', route => route.fulfill({ status: 200, contentType: 'text/html', body: fs.readFileSync(path.join(root, 'index-v3822.html'), 'utf8') }));
    await context.route('**/Chris-basement/data/daily-line-feed.json*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feed) }));
  }
  assert.equal(feed.failedRequests, 0);
  assert.ok(Date.now() - Date.parse(feed.generatedAt) < 3 * 3600000, 'feed must be fresh');
  const expected = new Map(feed.games.map(g => [g.league + ':' + g.id, g]));
  const attach = p => {
    p.on('pageerror', error => report.errors.push(String(error)));
    p.on('requestfailed', request => { if (report.requestsFailed.length < 40) report.requestsFailed.push({ url: request.url(), error: request.failure()?.errorText }); });
  };
  async function checkCards(frame) {
    const cards = await frame.locator('#line-games .line-card[data-event-id]').evaluateAll(nodes => nodes.map(el => ({
      id: el.dataset.eventId, league: el.dataset.sport,
      spread: el.querySelectorAll('.line-metrics strong')[0].textContent,
      total: el.querySelectorAll('.line-metrics strong')[1].textContent,
      text: el.innerText, box: { x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, right: el.getBoundingClientRect().right, bottom: el.getBoundingClientRect().bottom }
    })));
    for (const card of cards) {
      const game = expected.get(card.league + ':' + card.id);
      assert.ok(game, 'rendered event must exist in the published cache: ' + card.id);
      assert.equal(card.spread, game.odds.spread == null ? '—' : String(game.odds.spread), card.id + ' spread');
      assert.equal(card.total, game.odds.total == null ? '—' : String(game.odds.total), card.id + ' total');
      assert.ok(card.box.x >= 0 && card.box.y >= 0 && card.box.right <= 1921 && card.box.bottom <= 1081, 'card fits 1080p');
    }
    return cards;
  }
  const page = await context.newPage(); attach(page);
  await page.goto(chris + 'index-v3822.html?view=daily-line&verify=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.locator('#daily-line-view[data-feed-generated-at]').waitFor({ timeout: 45000 });
  await page.locator('#line-auto').click();
  assert.match(await page.locator('#line-auto').innerText(), /OFF/);
  const favorites = await checkCards(page);
  assert.ok(favorites.length >= 1, 'MY TEAMS must load from cached team IDs');
  report.checks.push({ check: 'Chris MY TEAMS exact spreads and totals', cards: favorites });
  let verified = 0, published = 0;
  for (const league of ['NFL', 'NCAA FOOTBALL', 'NCAA MEN', 'NBA', 'NHL', 'MLB']) {
    await page.locator('[data-line="' + league + '"]').click();
    const label = await page.locator('#line-page-label').innerText();
    const pages = Number(label.match(/page \d+\/(\d+)/)?.[1] || 1);
    for (let n = 0; n < pages; n++) {
      const cards = await checkCards(page);
      assert.ok(cards.every(c => c.league === league), 'league filter');
      verified += cards.length; published += cards.filter(c => c.spread !== '—' && c.total !== '—').length;
      if (n < pages - 1) await page.locator('#line-next').click();
    }
  }
  assert.ok(published > 0, 'real published spreads and totals required');
  report.checks.push({ check: 'All six league filters, pagination, exact ESPN cache values', verified, published });
  await page.locator('[data-line="MY"]').click();
  await page.screenshot({ path: path.join(output, 'chris-daily-line.png') });
  await page.locator('#back-to-ticker').click();
  assert.equal(await page.locator('#daily-line-view').isVisible(), false);
  // Read rendered home state without changing layout or user data.
  await page.waitForTimeout(12000);
  report.checks.push({ check: 'Chris home', sports: await page.locator('#games').innerText(), weather: await page.locator('#weather').innerText() });
  await page.screenshot({ path: path.join(output, 'chris-home.png') });
  const gp = await context.newPage(); attach(gp);
  await gp.goto(garage + '?verify=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await gp.waitForFunction(() => typeof window.openGarageSharedDailyLine === 'function');
  // The existing design hides the old Daily Line button after integrating lines.
  // Exercise its retained shared-view handler without revealing/moving controls.
  await gp.evaluate(() => window.openGarageSharedDailyLine());
  const frame = gp.frameLocator('#garage-shared-daily-line-frame');
  await frame.locator('#daily-line-view[data-feed-generated-at]').waitFor({ timeout: 45000 });
  await frame.locator('#line-auto').click();
  const garageCards = await checkCards(frame);
  assert.ok(garageCards.length > 0);
  report.checks.push({ check: 'Garage shared iframe exact spreads and totals', cards: garageCards });
  await gp.screenshot({ path: path.join(output, 'garage-daily-line.png') });
  await gp.locator('.garage-line-back').click();
  assert.equal(await gp.locator('#garage-shared-daily-line').isVisible(), false);
  await gp.waitForTimeout(12000);
  report.checks.push({ check: 'Garage home', sports: await gp.locator('#games').innerText(), weather: await gp.locator('#weather').innerText() });
  await gp.screenshot({ path: path.join(output, 'garage-home.png') });
  if (!live) {
    // Prove that MY TEAMS and odds need no browser-to-ESPN requests.
    const offline = await browser.newContext({ viewport: { width: 1920, height: 1080 }, timezoneId: 'America/New_York' });
    await offline.route('**/Chris-basement/index-v3822.html*', route => route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(root, 'index-v3822.html'), 'utf8') }));
    await offline.route('**/site.api.espn.com/**', route => route.abort());
    await offline.route('**/Chris-basement/data/daily-line-feed.json*', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(feed) }));
    const op = await offline.newPage();
    await op.goto(chris + 'index-v3822.html?view=daily-line', { waitUntil: 'domcontentloaded' });
    await op.locator('#daily-line-view[data-feed-generated-at]').waitFor({ timeout: 30000 });
    assert.ok((await checkCards(op)).length > 0);
    report.checks.push({ check: 'ESPN browser CORS blocked: cached MY TEAMS remains populated', passed: true });
    await offline.unroute('**/Chris-basement/data/daily-line-feed.json*');
    await offline.route('**/Chris-basement/data/daily-line-feed.json*', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...feed, generatedAt: new Date(Date.now() - 4 * 3600000).toISOString() }) }));
    await op.reload({ waitUntil: 'domcontentloaded' });
    await op.waitForTimeout(4000);
    assert.equal(await op.locator('#daily-line-view[data-feed-generated-at]').count(), 0);
    assert.equal(await op.locator('#line-games [data-event-id]').count(), 0, 'stale odds must not be rendered');
    report.checks.push({ check: 'Stale cache rejected with ESPN unavailable', passed: true });
    await offline.close();
  }
  assert.deepEqual(report.errors, [], 'no uncaught page JavaScript errors');
  report.generatedAt = feed.generatedAt;
  report.passed = true;
})().catch(error => { report.passed = false; report.failure = String(error.stack || error); process.exitCode = 1; })
.finally(async () => {
  if (browser) await browser.close();
  fs.writeFileSync(path.join(output, 'daily-line-' + (live ? 'live' : 'candidate') + '.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
});

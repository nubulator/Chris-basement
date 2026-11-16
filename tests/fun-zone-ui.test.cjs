'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index-v3822.html'), 'utf8');
const script = html.match(/<script id="v3821-funjs">([\s\S]*?)<\/script>/)[1];

// Exercise the actual production script with a minimal DOM and a controlled
// clock. These tests cover behavior, not pixel layout (checked in the browser).
class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {};
    this.dataset = {}; this.handlers = {}; this.classes = new Set(); this.value = '';
    this.clientHeight = 0; this.clientWidth = 0; this.isConnected = true;
    this.style = { setProperty() {} };
    this.classList = {
      add: (...names) => names.forEach(name => this.classes.add(name)),
      remove: (...names) => names.forEach(name => this.classes.delete(name)),
      contains: name => this.classes.has(name),
      toggle: (name, force) => {
        const on = force === undefined ? !this.classes.has(name) : force;
        on ? this.classes.add(name) : this.classes.delete(name); return on;
      }
    };
  }
  set className(value) { this.classes = new Set(value.split(/\s+/).filter(Boolean)); }
  get className() { return [...this.classes].join(' '); }
  set textContent(value) {
    this.children.forEach(child => { child.isConnected = false; child.parent = null; });
    this.children = []; this.value = String(value);
  }
  get textContent() { return this.value + this.children.map(child => child.textContent).join(''); }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  prepend(child) { child.parent = this; this.children.unshift(child); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); this.isConnected = false; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  addEventListener(type, handler) { (this.handlers[type] ||= []).push(handler); }
  emit(type) { for (const handler of this.handlers[type] || []) handler(); }
  querySelector(selector) {
    for (const child of this.children) {
      if (selector[0] === '.' && child.classes.has(selector.slice(1))) return child;
      const nested = child.querySelector(selector); if (nested) return nested;
    }
    return null;
  }
}

function harness(instant, loadBundle = true) {
  let now = new Date(instant).valueOf(), frameId = 0;
  const frames = new Map(), intervals = new Map(), windowEvents = {}, documentEvents = {};
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const elements = Object.fromEntries(['fun-feature','fun-counter','fun-next'].map(id => [id, new Element()]));
  const document = {
    hidden: false,
    getElementById: id => elements[id], createElement: tag => new Element(tag),
    addEventListener: (type, handler) => { (documentEvents[type] ||= []).push(handler); }
  };
  const window = { addEventListener: (type, handler) => { (windowEvents[type] ||= []).push(handler); } };
  const context = vm.createContext({
    window, document, Date: ClockDate, Intl, console,
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    setInterval: (callback, delay) => { intervals.set(delay, callback); return delay; },
    fetch: async () => ({ json: async () => ({ query: { pages: {} } }) })
  });
  if (loadBundle) vm.runInContext(fs.readFileSync(path.join(root, 'fun-zone-daily.js'), 'utf8'), context);
  vm.runInContext(script, context);
  return {
    elements, document, window, intervals,
    setTime: instant => { now = new Date(instant).valueOf(); },
    click: (count = 1) => { while (count-- > 0) elements['fun-next'].emit('click'); },
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); },
    emitDocument: type => { (documentEvents[type] || []).forEach(handler => handler()); },
    emitWindow: type => { (windowEvents[type] || []).forEach(handler => handler()); },
    panel: () => elements['fun-feature'],
    title: () => elements['fun-feature'].querySelector('.fun-headline').textContent,
    category: () => elements['fun-feature'].querySelector('.fun-category').textContent,
    counter: () => elements['fun-counter'].textContent
  };
}

test('production Next controls keep today’s clue and answer synchronized through all nine slides', () => {
  const ui = harness('2026-11-16T17:00:00Z');
  const daily = ui.window.BasementFunDaily.calendar();
  assert.equal(ui.counter(), '1 / 9'); assert.equal(ui.title(), daily.lyric.lyric);
  ui.click(8);
  assert.equal(ui.counter(), '9 / 9');
  assert.equal(ui.category(), 'CLASSIC ROCK LYRIC — ANSWER');
  assert.equal(ui.title(), daily.lyric.song + daily.lyric.artist);
  ui.click(); assert.equal(ui.counter(), '1 / 9'); assert.equal(ui.title(), daily.lyric.lyric);
});

test('history card renders its actual month/day/year and source, then clears source on next card', () => {
  const ui = harness('2026-11-16T17:00:00Z'), daily = ui.window.BasementFunDaily.calendar();
  ui.click(4);
  assert.equal(ui.counter(), '5 / 9'); assert.equal(ui.title(), 'November 16, ' + daily.history.year);
  assert.equal(ui.panel().dataset.funDate, '2026-11-16');
  assert.equal(ui.panel().querySelector('.fun-history-source').href, daily.history.source);
  assert.equal(ui.panel().querySelector('.fun-detail').textContent, daily.history.text + 'Source');
  ui.click(); assert.equal(ui.panel().querySelector('.fun-history-source'), null);
});

test('midnight on the auto timer displays the new clue instead of skipping to slide two', () => {
  const ui = harness('2026-11-17T04:59:59Z'), oldClue = ui.title(); ui.click(8);
  ui.setTime('2026-11-17T05:00:00Z'); ui.intervals.get(25000)(); ui.flush();
  assert.equal(ui.counter(), '1 / 9'); assert.notEqual(ui.title(), oldClue);
  assert.equal(ui.panel().dataset.funDate, '2026-11-17');
});

test('the date poll gives the new daily clue a full dwell before an automatic advance', () => {
  const ui = harness('2026-11-17T04:59:59Z'); ui.click(3);
  ui.setTime('2026-11-17T05:00:00Z'); ui.intervals.get(10000)();
  ui.setTime('2026-11-17T05:00:01Z'); ui.intervals.get(25000)(); ui.flush();
  assert.equal(ui.counter(), '1 / 9');
  ui.setTime('2026-11-17T05:00:26Z'); ui.intervals.get(25000)(); ui.flush();
  assert.equal(ui.counter(), '2 / 9');
});

test('a queued frame from yesterday cannot advance a clue already reset by the date poll', () => {
  const ui = harness('2026-11-17T04:59:59Z'); ui.click(8); ui.intervals.get(25000)();
  ui.setTime('2026-11-17T05:00:00Z'); ui.intervals.get(10000)(); ui.flush();
  assert.equal(ui.counter(), '1 / 9');
});

test('manual Next at midnight resets to the new clue, and the next click advances normally', () => {
  const ui = harness('2026-07-02T03:59:59Z'); ui.click(4);
  ui.setTime('2026-07-02T04:00:00Z'); ui.click();
  assert.equal(ui.counter(), '1 / 9'); assert.equal(ui.panel().dataset.funDate, '2026-07-02');
  ui.click(); assert.equal(ui.counter(), '2 / 9');
});

test('a sleeping TV does not accumulate advances and refreshes when it becomes visible', () => {
  const ui = harness('2026-11-16T20:00:00Z'); ui.click(6); ui.document.hidden = true;
  ui.intervals.get(25000)(); ui.intervals.get(25000)(); ui.flush();
  assert.equal(ui.counter(), '7 / 9');
  ui.setTime('2026-11-17T13:00:00Z'); ui.document.hidden = false; ui.emitDocument('visibilitychange');
  assert.equal(ui.counter(), '1 / 9'); assert.equal(ui.panel().dataset.funDate, '2026-11-17');
});

for (const event of ['pageshow','focus']) test(event + ' refreshes a resumed dashboard to today', () => {
  const ui = harness('2026-11-16T20:00:00Z'); ui.click(4);
  ui.setTime('2026-11-17T13:00:00Z'); ui.emitWindow(event);
  assert.equal(ui.counter(), '1 / 9'); assert.equal(ui.panel().dataset.funDate, '2026-11-17');
});

test('missing daily bundle shows an honest unavailable message while Next still works', () => {
  const ui = harness('2026-11-16T17:00:00Z', false);
  assert.match(ui.title(), /unavailable/); ui.click(4);
  assert.equal(ui.title(), 'No dated event available');
  assert.doesNotMatch(ui.panel().textContent, /SPOTLIGHT|Apollo|Beatles/);
});

test('an accidentally misdated history record is rejected instead of being relabeled as today', () => {
  const ui = harness('2026-11-16T17:00:00Z');
  ui.window.BasementFunDaily.history['11-16'] = [{year:1969,sourceDate:'07-20',text:'Wrong date',source:'https://example.com'}];
  ui.click(4);
  assert.equal(ui.title(), 'No dated event available');
  assert.doesNotMatch(ui.panel().textContent, /Wrong date/);
});

'use strict';

// Run with: node --test tests/fun-zone.test.cjs
// These checks cover calendar coverage, song-bank quality, and real clock
// boundaries. They do not independently fact-check every historical event.
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const daily = require('../fun-zone-daily.js');

const DAY = 86400000;
const normalize = value => String(value).normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();
const songKey = item => normalize(item.song);
const sameChallenge = (a, b) => {
  assert.equal(a.lyric.lyric, b.lyric.lyric);
  assert.equal(a.lyric.song, b.lyric.song);
  assert.equal(a.lyric.artist, b.lyric.artist);
};

function datesInYear(year) {
  const start = Date.UTC(year, 0, 1, 17);
  const stop = Date.UTC(year + 1, 0, 1, 17);
  const dates = [];
  for (let time = start; time < stop; time += DAY) dates.push(new Date(time));
  return dates;
}

test('the lyric bank contains a full leap year of distinct, short song clues', () => {
  assert.ok(daily.lyrics.length >= 366, 'At least 366 songs are required.');
  const songs = new Set();
  const clues = new Set();
  for (const item of daily.lyrics) {
    for (const field of ['lyric', 'song', 'artist']) {
      assert.equal(typeof item[field], 'string', 'Each challenge needs ' + field);
      assert.ok(item[field].trim(), field + ' cannot be empty.');
    }
    const words = item.lyric.trim().split(/\s+/);
    assert.ok(words.length <= 10, item.song + ' exceeds the short-excerpt limit.');
    const song = songKey(item);
    assert.ok(!songs.has(song), 'Repeated song or cover: ' + item.song);
    songs.add(song);
    const clue = normalize(item.lyric);
    assert.ok(!clues.has(clue), 'Repeated clue: ' + item.song);
    clues.add(clue);
  }
});

test('the rotation contains every song exactly once', () => {
  assert.equal(daily.rotation.length, daily.lyrics.length);
  assert.equal(new Set(daily.rotation).size, daily.lyrics.length);
  for (const index of daily.rotation) {
    assert.ok(Number.isInteger(index) && index >= 0 && index < daily.lyrics.length);
  }
});

test('history has actual records for all 366 month/day keys, including February 29', () => {
  const expected = datesInYear(2000).map(date => date.toISOString().slice(5, 10));
  assert.equal(expected.length, 366);
  assert.deepEqual(Object.keys(daily.history).sort(), expected.sort());
  for (const [key, events] of Object.entries(daily.history)) {
    assert.ok(Array.isArray(events) && events.length, 'No history for ' + key);
    for (const event of events) {
      assert.ok(Number.isInteger(event.year), key + ' needs a historical year.');
      assert.ok(event.year <= 2026, key + ' cannot contain a future event.');
      assert.equal(typeof event.text, 'string');
      assert.ok(event.text.trim().length >= 12, key + ' needs a meaningful event.');
      assert.ok(!/history spotlight|no event|unavailable|coming soon/i.test(event.text),
        key + ' must not use a placeholder or off-date spotlight.');
      const source = new URL(event.source);
      assert.ok(['https:', 'http:'].includes(source.protocol), key + ' needs a source URL.');
      if (event.monthDay !== undefined) assert.equal(event.monthDay, key);
      assert.equal(event.sourceDate, key, key + ' needs an explicit matching sourceDate.');
      if (event.dateSource !== undefined) {
        assert.ok(['https:', 'http:'].includes(new URL(event.dateSource).protocol));
      }
      if (event.date !== undefined && /^\d{2}-\d{2}$/.test(event.date)) assert.equal(event.date, key);
    }
  }
});

for (const year of [1900, 2000, 2027, 2028, 2100]) {
  test('every date in ' + year + ' has a distinct song and only eligible history', () => {
    const dates = datesInYear(year);
    const expectedDays = year === 2000 || year === 2028 ? 366 : 365;
    assert.equal(dates.length, expectedDays);
    const songs = new Set();
    const clues = new Set();
    dates.forEach((date, offset) => {
      const actual = daily.calendar(date);
      const dateKey = date.toISOString().slice(0, 10);
      const monthDay = dateKey.slice(5);
      assert.equal(actual.dateKey, dateKey);
      assert.equal(actual.monthDay, monthDay);
      assert.equal(actual.dayOfYear, offset + 1);
      assert.equal(actual.year, year);
      assert.equal(actual.month, Number(monthDay.slice(0, 2)));
      assert.equal(actual.day, Number(monthDay.slice(3)));
      assert.equal(actual.dayNumber, Math.floor(Date.UTC(year, actual.month - 1, actual.day) / DAY));
      const eligible = daily.history[monthDay].filter(event => event.year <= year);
      if (eligible.length) {
        assert.ok(actual.history, 'Missing eligible history for ' + dateKey);
        assert.ok(eligible.some(event =>
          event.year === actual.history.year && event.text === actual.history.text &&
          event.source === actual.history.source), 'Wrong history selection for ' + dateKey);
      } else {
        assert.equal(actual.history, null, 'Future history must not be shown for ' + dateKey);
      }
      const song = songKey(actual.lyric);
      const clue = normalize(actual.lyric.lyric);
      assert.ok(!songs.has(song), 'Song repeated during ' + year + ': ' + actual.lyric.song);
      assert.ok(!clues.has(clue), 'Clue repeated during ' + year);
      songs.add(song);
      clues.add(clue);
    });
  });
}

test('one full rotation stays unique across the year boundary', () => {
  const start = Date.UTC(2026, 10, 16, 17);
  const songs = new Set();
  for (let day = 0; day < daily.lyrics.length; day += 1) {
    const value = daily.calendar(new Date(start + day * DAY));
    const key = songKey(value.lyric);
    assert.ok(!songs.has(key), 'A song repeated before the full bank was used.');
    songs.add(key);
  }
  assert.equal(songs.size, daily.lyrics.length);
});

test('missing or mismatched history never substitutes another calendar date', () => {
  const key = '11-16';
  const saved = daily.history[key];
  try {
    daily.history[key] = [{
      year: 1900, sourceDate: '11-17', text: 'An event belonging to a different day.',
      source: 'https://en.wikipedia.org/wiki/November_17'
    }];
    assert.equal(daily.calendar(new Date('2026-11-16T17:00:00Z')).history, null);
    delete daily.history[key];
    assert.equal(daily.calendar(new Date('2026-11-16T17:00:00Z')).history, null);
  } finally {
    daily.history[key] = saved;
  }
});

test('the same Eastern date retains the same challenge before and after UTC midnight', () => {
  const early = daily.calendar(new Date('2026-11-16T05:00:00.000Z'));
  const afternoon = daily.calendar(new Date('2026-11-16T20:00:00.000Z'));
  const late = daily.calendar(new Date('2026-11-17T04:59:59.999Z'));
  assert.equal(early.dateKey, '2026-11-16');
  assert.equal(afternoon.dateKey, '2026-11-16');
  assert.equal(late.dateKey, '2026-11-16');
  assert.equal(early.dateLabel, 'November 16');
  sameChallenge(early, afternoon);
  sameChallenge(early, late);
  assert.deepEqual(early.history, late.history);
});

for (const [label, before, after, beforeKey, afterKey] of [
  ['winter midnight', '2026-11-17T04:59:59.999Z', '2026-11-17T05:00:00.000Z', '2026-11-16', '2026-11-17'],
  ['summer midnight', '2027-07-05T03:59:59.999Z', '2027-07-05T04:00:00.000Z', '2027-07-04', '2027-07-05'],
  ['New Year', '2027-01-01T04:59:59.999Z', '2027-01-01T05:00:00.000Z', '2026-12-31', '2027-01-01'],
  ['leap day', '2028-02-29T04:59:59.999Z', '2028-02-29T05:00:00.000Z', '2028-02-28', '2028-02-29'],
  ['after leap day', '2028-03-01T04:59:59.999Z', '2028-03-01T05:00:00.000Z', '2028-02-29', '2028-03-01']
]) {
  test(label + ' changes the challenge at Eastern midnight', () => {
    const previous = daily.calendar(new Date(before));
    const next = daily.calendar(new Date(after));
    assert.equal(previous.dateKey, beforeKey);
    assert.equal(next.dateKey, afterKey);
    assert.equal(next.dayNumber - previous.dayNumber, 1);
    assert.notEqual(songKey(previous.lyric), songKey(next.lyric));
    assert.ok(daily.history[next.monthDay].some(event => event.text === next.history.text));
  });
}

for (const [label, before, after, dateKey] of [
  ['spring forward', '2027-03-14T06:59:59.999Z', '2027-03-14T07:00:00.000Z', '2027-03-14'],
  ['fall back', '2027-11-07T05:59:59.999Z', '2027-11-07T06:00:00.000Z', '2027-11-07']
]) {
  test(label + ' does not consume a second daily challenge', () => {
    const previous = daily.calendar(new Date(before));
    const next = daily.calendar(new Date(after));
    assert.equal(previous.dateKey, dateKey);
    assert.equal(next.dateKey, dateKey);
    assert.equal(previous.dayNumber, next.dayNumber);
    assert.equal(previous.dayOfYear, next.dayOfYear);
    sameChallenge(previous, next);
    assert.deepEqual(previous.history, next.history);
  });
}

test('devices in different local time zones select identical Eastern content', () => {
  assert.equal(daily.timeZone, 'America/New_York');
  const modulePath = path.resolve(__dirname, '../fun-zone-daily.js');
  const script = 'const m=require(' + JSON.stringify(modulePath) + ');' +
    'process.stdout.write(JSON.stringify(m.calendar(new Date("2026-11-17T04:59:59.999Z"))));';
  let reference;
  for (const TZ of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
    const child = spawnSync(process.execPath, ['-e', script], {
      env: { ...process.env, TZ }, encoding: 'utf8', timeout: 10000
    });
    assert.equal(child.status, 0, child.stderr);
    const actual = JSON.parse(child.stdout);
    assert.equal(actual.dateKey, '2026-11-16');
    if (reference) assert.deepEqual(actual, reference);
    reference = actual;
  }
});

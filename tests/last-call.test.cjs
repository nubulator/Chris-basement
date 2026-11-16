// Run with: node tests/last-call.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const scripts = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const storage = new Map();
function game(data = storage) {
  const elements = new Map();
  let now = 0, timerId = 0;
  const timers = new Map();
  function classes() {
    const values = new Set();
    return {add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
  }
  function element() {
    const attributes = new Map();
    return {hidden:false, textContent:'', innerHTML:'', style:{}, classList:classes(),
      parentElement:{classList:classes()}, setAttribute:(key,value)=>attributes.set(key,value),
      getAttribute:key=>attributes.get(key), removeAttribute:key=>attributes.delete(key), addEventListener(){},
      appendChild(){}, append(){}, replaceChildren(){}, querySelectorAll(){return []}, focus(){}};
  }
  const context = vm.createContext({
    localStorage:{getItem:k=>data.get(k) ?? null, setItem:(k,v)=>data.set(k,v)},
    document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},
      createElement:element, createElementNS:element},
    location:{reload(){},href:'https://example.test/last-call.html'},
    setTimeout:fn=>fn(), clearInterval:id=>timers.delete(id),
    setInterval:fn=>{timers.set(++timerId,fn);return timerId},
    Date:class extends Date {static now(){return now}},URL,console
  });
  context.window = context;
  vm.runInContext(read('shared-question-banks.js'),context);
  vm.runInContext(scripts(read('last-call.html'))[0],context);
  return {run:code=>vm.runInContext(code,context),elements,context,timers,
    advance(ms){now+=ms;for(const tick of [...timers.values()])tick()}};
}
// Syntax-check every inline script, including the two consumers of shared data.
for(const file of ['last-call.html','trivia.html','music.html']) {
  for(const script of scripts(read(file))) new vm.Script(script,{filename:file});
  assert.equal((read(file).match(/shared-question-banks\.js\?v=1/g)||[]).length,1);
}
let g = game();
// Expanded Categories deck stays unique across reloads and avoids back-to-back cycles.
assert.equal(g.run('categories.length'),29);
const categorySeen = new Set();
let lastCategory;
for(let i=0;i<29;i++){
  if(i===10)g=game();
  lastCategory=g.run('outcome(10)');
  assert.ok(!categorySeen.has(lastCategory),'Repeated category: '+lastCategory);
  categorySeen.add(lastCategory);
}
assert.notEqual(g.run('outcome(10)'),lastCategory);
// Migrate an existing four-card deck: preserve two unused cards and add all 25 new ones.
const legacy = new Map([['last-call-question-rotation-v1',JSON.stringify({categories:[1,3]})]]);
let migrated=game(legacy);
const migratedSeen=new Set();
for(let i=0;i<27;i++){
  if(i===10)migrated=game(legacy);
  const prompt=migrated.run('outcome(10)');
  assert.ok(!migratedSeen.has(prompt),'Repeated during category migration');
  assert.notEqual(prompt,migrated.run('categories[0]'));
  assert.notEqual(prompt,migrated.run('categories[2]'));
  migratedSeen.add(prompt);
}
assert.equal(migratedSeen.size,27);
// A timed result provides a complete 3-second reading period, then a full 15 seconds.
const timed=game(new Map());
timed.run("Math.random=()=>10.5/12; $('spin').onclick()");
assert.equal(timed.run("$('challengeTimer').textContent"),'READY 3');
timed.advance(1000);
assert.equal(timed.run("$('challengeTimer').textContent"),'READY 2');
timed.advance(1999);
assert.equal(timed.run("$('challengeTimer').textContent"),'READY 1');
timed.advance(1);
assert.equal(timed.run("$('challengeTimer').textContent"),'0:15');
assert.equal(timed.run("$('challengeTimer').classList.contains('preparing')"),false);
timed.advance(999);
assert.equal(timed.run("$('challengeTimer').textContent"),'0:15');
timed.advance(1);
assert.equal(timed.run("$('challengeTimer').textContent"),'0:14');
timed.advance(14000);
assert.equal(timed.run("$('challengeTimer').textContent"),'TIME’S UP');
assert.equal(timed.timers.size,0);
timed.run("Math.random=()=>7.5/12; $('spin').onclick()");
assert.equal(timed.run("$('challengeTimer').textContent"),'READY 3','Rock Star uses the same delay');
timed.advance(2000);
timed.run("$('reset').onclick()");
timed.advance(18000);
assert.equal(timed.run("$('challengeTimer').hidden"),true);
assert.equal(timed.run("$('challengeTimer').textContent"),'');
assert.equal(timed.timers.size,0,'Reset cancels the preparation countdown');
timed.run('startChallengeTimer()');
timed.run("Math.random=()=>1.5/12; $('spin').onclick()");
assert.equal(timed.run("$('challengeTimer').hidden"),true);
assert.equal(timed.timers.size,0,'New spin cancels the previous timer');
assert.equal(g.run('segments.length'),12);
assert.equal(g.run("segments.filter(s=>s[0]==='GAME OVER').length"),1);
assert.match(g.run('outcome(8)'),/Take a sip/);
// Both endings: early Game Over lets the next player play; TAKE SIP never ends a game.
g.run("names=['Chris','Beth']; Math.random=()=>2.5/12; $('spin').onclick()");
assert.equal(g.run('gameOver'),false);
g.run("Math.random=()=>8.5/12; $('spin').onclick()");
assert.equal(g.run('gameOver'),false);
assert.equal(g.run("$('resultTitle').textContent"),'TAKE A SIP');
g.run("Math.random=()=>2.5/12; $('spin').onclick()");
assert.equal(g.run('gameOver'),true);
assert.equal(g.run("$('spin').disabled"),true);
// Every twister follows the same instruction, from the wheel and the challenge picker.
for(let i=0;i<5;i++) {
  assert.match(g.run('outcome(0)'),/at least three times quickly/);
  g.run("showSelectedChallenge('twister')");
  assert.match(g.run("$('challenge').textContent"),/at least three times quickly/);
}
const total = g.run('rouletteTriviaPool().length');
assert.ok(total>=240);
const seen = new Set();
for(let i=0;i<total;i++) {
  if(i===40)g.run("$('reset').onclick()");
  if(i===80)g=game(); // Reload the page with saved browser storage.
  const question=g.run('drawTrivia()');
  assert.ok(!seen.has(question.key),'Repeated before pool exhausted: '+question.q);
  seen.add(question.key);
}
const last=g.run('triviaRotation.last');
assert.notEqual(g.run('drawTrivia().key'),last,'Immediate repeat at cycle boundary');
// Questions added later are eligible immediately, regardless of an existing rotation.
const extra={id:'web-test',q:'Which of these is the new test answer?',a:'Correct',choices:['Correct','Wrong 1','Wrong 2','Wrong 3']};
storage.set('chris-trivia-tavern-v1',JSON.stringify({records:{extra:[extra,{...extra,id:'duplicate'},
  {id:'web-legacy',q:'Incomplete imported question?',a:'Answer'}]}}));
storage.set('chris-music-vault-extra-v1',JSON.stringify([{id:'music-extra-test',q:'New music test question?',a:'Correct',choices:extra.choices}]));
assert.equal(g.run('rouletteTriviaPool().length'),total+2);
const pool=g.run('rouletteTriviaPool()');
storage.set('last-call-shared-trivia-v1',JSON.stringify({seen:pool.filter(q=>q.q!==extra.q).map(q=>q.key)}));
g.run("showSelectedChallenge('trivia')");
assert.match(g.run("$('challenge').textContent"),/A\. Correct/);
assert.equal(g.run("$('revealAnswer').hidden"),false);
g.run("$('revealAnswer').onclick()");
assert.equal(g.run("$('challenge').textContent"),'ANSWER: Correct');
// Broken saved content and unavailable storage do not break question selection.
for(const key of ['chris-trivia-tavern-v1','chris-music-vault-extra-v1','last-call-shared-trivia-v1'])storage.set(key,'broken json');
assert.equal(g.run('rouletteTriviaPool().length'),total);
g.context.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
g.run('triviaRotation={seen:[],last:""}');
const memorySeen=new Set();
for(let i=0;i<30;i++){
  const q=g.run('drawTrivia()');assert.ok(!memorySeen.has(q.key));memorySeen.add(q.key);
}
// Loading either game still provides its original question IDs for saved decks.
assert.equal(g.run('GameRoomQuestionBanks.tavern.length'),100);
assert.equal(g.run('GameRoomQuestionBanks.music.length'),150);
// Every landing opens its own scene, hides the wheel, and can return to the next turn.
for(let idx=0;idx<12;idx++){
  const scene=game(new Map());
  scene.run(`names=['Chris','Beth']; Math.random=()=>${idx+.5}/12; $('spin').onclick()`);
  assert.equal(scene.run("$('wheelStage').hidden"),true);
  assert.equal(scene.run("$('wheelActions').hidden"),true);
  assert.equal(scene.run("$('rouletteLayout').classList.contains('is-revealing')"),true);
  assert.equal(scene.run("$('resultCard').getAttribute('data-theme')"),idx===2?'escape':scene.run(`revealThemes[${idx}][0]`));
  assert.equal(scene.run('turn'),1,'Advance the turn exactly once after landing');
  scene.run("$('nextSpin').onclick()");
  assert.equal(scene.run('turn'),1,'Closing a reveal must not skip the next player');
  assert.equal(scene.run("$('wheelStage').hidden"),false);
  assert.equal(scene.run("$('rouletteLayout').classList.contains('is-revealing')"),false);
  assert.equal(scene.timers.size,0,'Returning to the wheel cancels timed challenges');
}
const finale=game(new Map());
finale.run("names=['Chris']; Math.random=()=>2.5/12; $('spin').onclick()");
assert.equal(finale.run('gameOver'),true);
assert.match(finale.run("$('resultText').textContent"),/Chris, you're tonight's loser/);
assert.equal(finale.run("$('nextSpin').textContent"),'PLAY AGAIN ↻');
finale.run("$('nextSpin').onclick()");
assert.equal(finale.run('gameOver'),false);
assert.equal(finale.run("$('wheelStage').hidden"),false);
assert.equal(finale.run('played.size'),0);
// All 70 truths are unique through reload; existing decks receive the 40 new villa cards.
const truthSave=new Map(); let truthsGame=game(truthSave); const truthSeen=new Set(); let lastTruth;
assert.equal(truthsGame.run('truths.length'),70);
for(let i=0;i<70;i++){
  if(i===20)truthsGame=game(truthSave);
  lastTruth=truthsGame.run('pick(truths)');assert.ok(!truthSeen.has(lastTruth));truthSeen.add(lastTruth);
}
assert.notEqual(truthsGame.run('pick(truths)'),lastTruth);
const oldTruthDeck=new Map([['last-call-question-rotation-v1',JSON.stringify({truths:[1,3]})]]);
const truthMigration=game(oldTruthDeck); const newTruthSeen=new Set();
for(let i=0;i<42;i++){
  const prompt=truthMigration.run('pick(truths)');assert.ok(!newTruthSeen.has(prompt));newTruthSeen.add(prompt);
  assert.notEqual(prompt,truthMigration.run('truths[0]'));assert.notEqual(prompt,truthMigration.run('truths[2]'));
}
const villa=game(new Map());
villa.run("names=['Chris','Beth']; Math.random=()=>6.5/12; $('spin').onclick()");
assert.equal(villa.run("$('anotherTruth').hidden"),false);
const firstTruth=villa.run("$('challenge').textContent");
villa.run("$('anotherTruth').onclick()");
assert.notEqual(villa.run("$('challenge').textContent"),firstTruth);
assert.equal(villa.run('turn'),1);
villa.run("$('passTruth').onclick()");
assert.equal(villa.run("$('wheelStage').hidden"),false);
assert.equal(villa.run('turn'),1);
console.log('PASS: 12 themed scenes; early escape and true finale; next-spin turn continuity; timer cleanup; 70 nonrepeating truths; saved truth-deck migration; reroll and pass.');
console.log('PASS: 29 unique Categories prompts; existing-deck migration and reload; 3-second preparation plus full 15-second timer; timer cancellation; one Game Over; both twister paths; '+total+' unique trivia questions; reload/reset persistence; cycle boundary; shared extras and choices; storage fallback; all page scripts parse.');


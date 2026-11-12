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
  function element() {
    return {hidden:false, textContent:'', innerHTML:'', style:{}, classList:{add(){}, remove(){}},
      parentElement:{classList:{add(){}, remove(){}}}, setAttribute(){}, addEventListener(){},
      appendChild(){}, append(){}, replaceChildren(){}, querySelectorAll(){return []}, focus(){}};
  }
  const context = vm.createContext({
    localStorage:{getItem:k=>data.get(k) ?? null, setItem:(k,v)=>data.set(k,v)},
    document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},
      createElement:element, createElementNS:element},
    location:{reload(){},href:'https://example.test/last-call.html'},
    setTimeout:fn=>fn(), clearInterval(){},setInterval(){},URL,console
  });
  context.window = context;
  vm.runInContext(read('shared-question-banks.js'),context);
  vm.runInContext(scripts(read('last-call.html'))[0],context);
  return {run:code=>vm.runInContext(code,context),elements,context};
}
// Syntax-check every inline script, including the two consumers of shared data.
for(const file of ['last-call.html','trivia.html','music.html']) {
  for(const script of scripts(read(file))) new vm.Script(script,{filename:file});
  assert.equal((read(file).match(/shared-question-banks\.js\?v=1/g)||[]).length,1);
}
let g = game();
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
console.log('PASS: one Game Over; both twister paths; '+total+' unique trivia questions; reload/reset persistence; cycle boundary; shared extras and choices; storage fallback; all page scripts parse.');

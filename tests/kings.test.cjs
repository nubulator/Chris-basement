// Run with: node tests/kings.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'kings.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for (const script of scripts) new vm.Script(script);
const elements = new Map(), storage = new Map();
function element(tag = 'div') {
  const e = {tagName:tag.toUpperCase(),children:[],className:'',textContent:'',value:'',focus(){},setAttribute(){},append(...c){this.children.push(...c)}};
  Object.defineProperty(e,'innerHTML',{get(){return this.markup || ''},set(v){this.markup=v;this.children=[]}});
  e.querySelectorAll = selector => e.children.flatMap(c => [...(selector === c.tagName.toLowerCase() ? [c] : []),...c.querySelectorAll(selector)]);
  e.querySelector = selector => e.querySelectorAll(selector)[0];
  e.classList = {contains:k=>e.className.split(' ').includes(k),add:k=>{if(!e.classList.contains(k))e.className+=' '+k},remove:k=>{e.className=e.className.split(' ').filter(x=>x!==k).join(' ')},toggle:(k,on)=>on?e.classList.add(k):e.classList.remove(k)};
  return e;
}
const context = vm.createContext({document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,querySelectorAll(){return []},addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},requestAnimationFrame:fn=>fn(),window:{addEventListener(){}},console});
context.GameRoomNames={append(){},addOptions(){}};
const run = code => vm.runInContext(code,context);
run(scripts[0]);
run('start()');
assert.equal(run('deck.length'),20);
assert.equal(run('new Set(deck.map(c=>c.r+c.s)).size'),20);
// Every face has an accurate accessible rank/suit; decorative art never supplies game values.
for(const rank of ['10','J','Q','K','A']) for(const suit of ['♠','♥','♦','♣']) {
  const face = run(`cardFace(${JSON.stringify({r:rank,s:suit})})`);
  assert.match(face,/<span class="card-name">[^<]+ of (spades|hearts|diamonds|clubs)<\/span>/);
  assert.equal(face.split(`<b>${rank}</b>`).length-1,2);
  assert.equal(face.split(`<span>${suit}</span>`).length-1,rank==='10'?12:2);
  const image=face.match(/src="\.\/([^\"]+)"/);
  if(image)assert.ok(fs.existsSync(path.join(root,image[1])));
}
// A repeated personal rank doubles, while a card dealt to another player does not reset it.
run("names=['One','Two'];hands=[[],[]];turn=0;position=0;kingCount=0;waiting=false;finished=false;deck=[{r:'Q',s:'♥'},{r:'A',s:'♣'},{r:'Q',s:'♠'},{r:'J',s:'♦'}];draw()");
assert.equal(run("$('action').textContent"),'SOCIAL');
run('draw()');assert.equal(run('position'),1,'Repeated draw while waiting does nothing');
run('next();draw();next();draw()');
assert.equal(run("$('action').textContent"),'SOCIAL ×2 DUPLICATE!');
assert.equal(run('turn'),0);
assert.equal(run('hands[0].length'),2);
// Directional actions keep correct neighboring players and quantities.
run("names=['One','Two','Three'];turn=0");
assert.equal(run("directionalAction('J',2)"),'Two: 4 drinks. Three: 2 drinks.');
assert.equal(run("directionalAction('10',1)"),'Three: 2 drinks. Two: 1 drink.');
// Four kings never multiply and the fourth ends play; Next/Draw cannot advance afterward.
run("names=['One'];hands=[[]];turn=0;position=0;kingCount=0;waiting=false;finished=false;deck=suits.map(s=>({r:'K',s}))");
for(let i=0;i<4;i++){
  run('draw()');
  assert.equal(run('kingCount'),i+1);
  assert.equal(run('finished'),i===3);
  if(i<3){assert.equal(run("$('action').textContent"),'KING — SHOT');run('next()');}
}
assert.equal(run("$('winner').textContent"),'One IS THE LOSER!');
run('next();draw()');assert.equal(run('position'),4);
run("$('restart').onclick()");
assert.ok(run("$('game').classList.contains('hidden')"));
assert.ok(!run("$('setup').classList.contains('hidden')"));
console.log('Kings passed: 20 accurate card faces, unique deck, turns, personal doubles, directional actions, fourth King and restart.');

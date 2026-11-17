// Run with: node tests/trivia.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const scripts = [...read('trivia.html').matchAll(/<script(?: type="application\/x-game-storage")?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const script of scripts)new vm.Script(script);
const elements = new Map();
const stored = new Map([['chris-trivia-tavern-last-restock',String(Date.now())]]);
function element(){
  const classes = new Set();
  return {value:'',textContent:'',innerHTML:'',children:[],style:{},dataset:{},
    classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},
    appendChild(c){this.children.push(c)},append(c){this.children.push(c)},after(){},replaceChildren(...c){this.children=c},removeAttribute(){},focus(){},addEventListener(){},setAttribute(){},querySelectorAll(){return []}};
}
let updatePresentation;
const context=vm.createContext({document:{body:element(),getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,addEventListener(){},querySelectorAll(){return []}},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)},MutationObserver:class{constructor(fn){updatePresentation=fn}observe(){}},requestAnimationFrame:fn=>fn(),confirm:()=>true,console});
context.window=context;context.GameRoomStorage={store:context.localStorage};context.setTimeout=()=>0;context.clearTimeout=()=>{};
const run=code=>vm.runInContext(code,context);
run(read('shared-question-banks.js'));run(read('picture-bank.js'));run(read('picture-clues.js'));run(scripts[0]);run(read('trivia-premium.js'));
const update=()=>updatePresentation();
run("$('start').onclick()");assert.equal(run("$('setupNotice').textContent"),'Enter at least one player.');
run("$('player0').value='Ada';$('player1').value='Ada';$('start').onclick()");assert.equal(run("$('setupNotice').textContent"),'Each player needs a unique name.');
run("$('player1').value='Bea';$('length').value='25';$('holidayTheme').value='';$('start').onclick()");update();
assert.equal(run('state.deck.length'),25);assert.equal(run('new Set(state.deck).size'),25);
assert.ok(run("document.body.classList.contains('tavern-playing')"));
assert.ok(!run("document.body.classList.contains('tavern-answer')"));
run("$('reveal').onclick()");update();assert.ok(run("document.body.classList.contains('tavern-answer')"));
run("award('Ada')");update();assert.equal(run("scores().Ada"),1);assert.ok(run("document.body.classList.contains('tavern-ready')"));
run("award('Ada')");assert.equal(run('state.awards.length'),1,'Repeated award while ready is ignored');
run("$('nextQuestion').onclick()");update();assert.equal(run('state.index'),1);
assert.ok(!run("document.body.classList.contains('tavern-ready')"));
assert.ok(!run("document.body.classList.contains('tavern-answer')"));
run('undo()');update();assert.equal(run('state.index'),0);assert.equal(run('scores().Ada'),0);
assert.ok(run("document.body.classList.contains('tavern-answer')"));
// Nobody advances only after the explicit ready confirmation and awards no points.
run('award(null)');update();assert.equal(run('scores().Ada'),0);assert.equal(run('state.pendingNext'),true);
run("$('nextQuestion').onclick()");update();assert.equal(run('state.index'),1);
// Finishing does not save standings until committed; a repeat commit cannot double-count.
run("state.awards=[{index:0,player:'Ada'},{index:1,player:'Bea'}];finish()");update();
assert.ok(run("document.body.classList.contains('tavern-finished')"));
assert.ok(!run("document.body.classList.contains('tavern-playing')"));assert.equal(run('records.rounds'),0);
let cloudWrites=0;context.triviaCloudSave=()=>cloudWrites++;
run('commitResults();commitResults()');assert.equal(run('records.rounds'),1);assert.equal(cloudWrites,1);
assert.equal(run('records.players.Ada.wins'),1);assert.equal(run('records.players.Bea.wins'),1);
run("$('discardFinished').onclick()");update();assert.equal(run('started'),false);
assert.ok(!run("document.body.classList.contains('tavern-finished')"));assert.equal(run('records.rounds'),1);
// A 50-question holiday round remains unique and fills from the regular bank when needed.
run("$('length').value='50';$('holidayTheme').value='Christmas';$('start').onclick()");
assert.equal(run('state.deck.length'),50);assert.equal(run('new Set(state.deck).size'),50);
assert.ok(run("state.deck.some(id=>HOLIDAY_QUESTIONS.some(q=>q.id===id&&q.cat==='Christmas'))"));
console.log('Trivia passed: name validation, 25/50-question decks, holiday round, reveal, award, ready, undo, Nobody, finish, commit-once and presentation transitions.');

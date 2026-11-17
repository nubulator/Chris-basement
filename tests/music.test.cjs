// Run with: node tests/music.test.cjs. No network or real storage used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const scripts=[...read('music.html').matchAll(/<script(?: type="application\/x-game-storage")?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const code of scripts)new vm.Script(code);
const elements=new Map(),stored=new Map([['chris-music-vault-last-restock',String(Date.now())]]);
function element(tag){const classes=new Set(),attrs={};let html='';return {value:'',textContent:'',children:[],style:{},dataset:{},get innerHTML(){return html},set innerHTML(v){html=v;if(tag==='textarea')this.value=v.replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&quot;/g,'"')},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},appendChild(c){this.children.push(c)},append(...c){this.children.push(...c)},after(){},replaceChildren(...c){this.children=c},removeAttribute(k){delete attrs[k]},focus(){},addEventListener(){},setAttribute(k,v){attrs[k]=v},getAttribute:k=>attrs[k],querySelectorAll(){return []},querySelector(){return null},closest(){return null},getBoundingClientRect(){return {top:0,bottom:0,left:0,right:0}}};}
const cats=['all','80s','90s','2000s','2010s','classic','hiphop','pop'].map((c,i)=>{const e=element();e.dataset.category=c;e.setAttribute('aria-pressed',String(!i));return e});
const categories=element();categories.querySelectorAll=()=>cats;elements.set('musicCategories',categories);
let update;
const context=vm.createContext({document:{body:element(),getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)},MutationObserver:class{constructor(f){update=f}observe(){}},requestAnimationFrame:f=>f(),matchMedia:()=>({matches:false}),confirm:()=>true,console});context.window=context;context.GameRoomNames={append(){},addOptions(){}};context.GameRoomStorage={store:context.localStorage};context.setTimeout=()=>0;context.clearTimeout=()=>{};
const run=s=>vm.runInContext(s,context);run(read('shared-question-banks.js'));run(read('picture-bank.js'));run(read('picture-clues.js'));run(scripts[0]);run(read('music-premium.js'));
run("$('difficulty').value='Mixed';$('length').value='25';$('start').onclick()");assert.equal(run("$('setupNotice').textContent"),'Enter at least one player.');
run("$('p0').value='Chris';$('p1').value='chris';$('start').onclick()");assert.equal(run("$('setupNotice').textContent"),'Use different names for each player.');
run("$('p1').value='Beth';$('start').onclick()");update();assert.equal(run('state.deck.length'),25);assert.equal(run('new Set(state.deck).size'),25);assert.ok(run("document.body.classList.contains('music-playing')"));
const firstDeck=JSON.parse(run('JSON.stringify(state.deck)'));
run("award('Chris')");assert.equal(run('state.awards.length'),0);
run("$('reveal').onclick();award('Chris');award('Chris')");update();assert.equal(run('tally().Chris'),1);assert.equal(run('state.awards.length'),1);assert.ok(run("document.body.classList.contains('music-ready')"));
run("$('nextTrack').onclick()");update();assert.equal(run('state.index'),1);assert.ok(!run("document.body.classList.contains('music-answer')"));
run('undo()');update();assert.equal(run('state.index'),0);assert.equal(run('tally().Chris'),0);assert.ok(run("document.body.classList.contains('music-answer')"));
run("award(null);$('nextTrack').onclick()");assert.equal(run('state.index'),1);assert.equal(run('tally().Chris'),0);
run("state.awards=[{index:0,player:'Chris'},{index:1,player:'Beth'}];finish()");update();assert.equal(run('records.rounds'),0);assert.ok(run("document.body.classList.contains('music-finished')"));
let writes=0;context.musicCloudSave=()=>writes++;run('commit();commit()');assert.equal(writes,1);assert.equal(run('records.rounds'),1);assert.equal(run('records.players.Chris.wins'),1);assert.equal(run('records.players.Beth.wins'),1);
run("$('again').onclick();$('length').value='50';$('start').onclick()");assert.equal(run('state.deck.length'),50);assert.equal(run('new Set(state.deck).size'),50);assert.ok(JSON.parse(run('JSON.stringify(state.deck)')).every(id=>!firstDeck.includes(id)));
run("$('abandon').onclick()");assert.equal(run('records.rounds'),1);
assert.ok(run("eligibleMusic('Easy',['pop']).every(q=>q.level==='Easy'&&(MUSIC_TAGS[q.id]||q.tags||[]).includes('pop'))"));
assert.ok(run("needsMissingChoices({id:'music-extra-old',q:'Which of these bands?',a:'A'})"));
run("rememberMusicQuestions(eligibleMusic('Mixed',[]));$('start').onclick()");assert.equal(run('started'),false);assert.ok(run("$('setupNotice').textContent.includes('Repeats are off')"));
run("$('replayMusic').onclick();$('start').onclick()");assert.equal(run('state.deck.length'),50);assert.equal(run('records.rounds'),1);
// Verify the correct multiple-choice option is marked on reveal.
run("QUESTIONS.push({id:'qa-choice',q:'Which group?',a:'Band B',level:'Easy',genre:'Rock',choices:['Band A','Band B','Band C','Band D']});state.deck=['qa-choice'];state.index=0;state.completed=false;state.pending=false;state.revealed=true;render()");
assert.ok(run("$('musicChoices').children.some(c=>c.textContent==='B. Band B'&&c.classList.contains('correct'))"));
console.log('Music passed: unique 25/50 decks, saved history/no automatic repeats, category/difficulty, validation, reveal, scoring gates, ready, undo, Nobody, finish, tie winners, commit once, replay opt-in and presentation transitions.');


for(const raw of ['null','{}','[null,7,"Chris"]']) {
 stored.set('chris-music-performers',raw);
 assert.equal(run('Array.isArray(savedPerformers())&&savedPerformers().every(n=>typeof n==="string")'),true);
}
stored.set('chris-music-names','null');
assert.doesNotThrow(()=>run('init()'));
console.log('PASS: invalid saved performer data does not break setup.');

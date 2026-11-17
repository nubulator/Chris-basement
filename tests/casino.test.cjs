// Run with: node tests/casino.test.cjs. Uses isolated fake DOM/storage; no network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const scripts=[...read('casino.html').matchAll(/<script(?: type="application\/x-game-storage")?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const s of scripts)new vm.Script(s);
function element(id=''){const classes=new Set(),attrs={};return {id,value:'',textContent:'',innerHTML:'',style:{},dataset:{},disabled:false,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},focus(){},closest(){return null},addEventListener(){},setAttribute(k,v){attrs[k]=v},getAttribute:k=>attrs[k],querySelectorAll(){return []}}}
const elements=new Map(),stored=new Map(),sidebar=element(),panes=['leaders','fame','rules'].map(p=>{const e=element();e.dataset.casinoPane=p;return e});sidebar.querySelectorAll=()=>panes;
const context=vm.createContext({document:{body:element(),querySelector:()=>sidebar,getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id)}},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)},confirm:()=>true,console});context.window=context;context.GameRoomNames={append(){},addOptions(){}};context.GameRoomStorage={store:context.localStorage};
const run=code=>vm.runInContext(code,context);run(read('casino-premium.js'));run(scripts[0]);
assert.equal(run('newDeck().length'),52);assert.equal(run('new Set(newDeck().map(c=>c.label+c.suit)).size'),52);
// Every dealt face retains exact accessible rank/suit; numbered cards have exact pip counts.
run("for(const c of newDeck()){card($('currentCard'),c);if($('currentCard').getAttribute('aria-label')!==CasinoCardArt.name(c))throw Error('Bad card name');if(c.rank<=10&&($('currentCard').innerHTML.match(/class=\"pip/g)||[]).length!==c.rank)throw Error('Bad pips '+c.label)}");
run("card($('nextCard'),null,true)");assert.equal(run("$('nextCard').innerHTML"),'');assert.equal(run("$('nextCard').getAttribute('aria-label')"),'Face-down next card');
for(const [rank,label,asset] of [[11,'J','jack'],[12,'Q','queen'],[13,'K','king']]){assert.ok(run(`CasinoCardArt.face({rank:${rank},label:'${label}',suit:'♠'}).includes('${asset}-v1.webp')`));}
run("$('start').onclick()");assert.equal(run("$('setupNotice').textContent"),'Enter at least one player.');
run("$('p0').value='Chris';$('p1').value='chris';$('start').onclick()");assert.equal(run("$('setupNotice').textContent"),'Player names must be unique.');
run("$('p1').value='Beth';$('roundCount').value='5';$('start').onclick()");assert.equal(run('state.pot'),100);assert.equal(run('state.turn'),0);assert.equal(run('state.deck.length'),51);assert.equal(sidebar.dataset.pane,'leaders');
assert.ok(run("savedNames.includes('Chris')&&savedNames.includes('Beth')"));
// Controlled cards exercise the production engine without changing its deck logic.
run("state.current={rank:13,label:'K',suit:'♠'};state.deck=[{rank:14,label:'A',suit:'♥'}];guess('higher')");assert.equal(run('state.pot'),200);assert.equal(run('state.streak'),1);assert.equal(run('state.phase'),'result');assert.equal(run("$('currentCard').getAttribute('aria-label')"),'Ace of hearts');
run("state.deck=[{rank:14,label:'A',suit:'♣'}];guess('lower')");assert.equal(run('state.pot'),200);assert.equal(run('state.streak'),1);assert.ok(run("state.message.startsWith('PUSH')"));
run("$('double').onclick()");assert.equal(run('state.phase'),'bonusPick');assert.ok(run("$('bankControls').classList.contains('hidden')"));
run("state.deck=[{rank:2,label:'2',suit:'♦'}];guess('lower')");assert.equal(run('state.phase'),'banked');assert.equal(run('state.scores[0]'),400);assert.equal(run('state.pot'),0);
run('bank()');assert.equal(run('state.scores[0]'),400,'Repeated bank after banked cannot add chips');
run("$('continue').onclick()");assert.equal(run('state.player'),1);assert.equal(run('state.pot'),100);
run("state.current={rank:8,label:'8',suit:'♣'};state.deck=[{rank:3,label:'3',suit:'♠'}];guess('higher')");assert.equal(run('state.phase'),'bust');assert.equal(run('state.pot'),0);assert.equal(run('state.scores[1]'),0);
run("$('continue').onclick();bank()");assert.equal(run('state.scores[0]'),500);
// End-game reset keeps standings unchanged and allows a fresh night.
run("$('restart').onclick()");assert.equal(run('started'),false);assert.equal(run('records.games'),0);
run("$('p0').value='Chris';$('p1').value='Beth';$('roundCount').value='5';$('start').onclick()");let cloudWrites=0;context.casinoCloudSave=()=>cloudWrites++;
for(let i=0;i<10;i++)run("bank();$('continue').onclick()");assert.equal(run('state.phase'),'done');assert.equal(run('records.games'),1);assert.equal(cloudWrites,1);assert.equal(run('records.players.Chris.wins'),1);assert.equal(run('records.players.Beth.wins'),1);assert.equal(sidebar.dataset.pane,'fame');
run('render();advance();bank()');assert.equal(run('records.games'),1);assert.equal(cloudWrites,1);
run("$('again').onclick()");assert.equal(run('started'),false);assert.equal(run('state'),null);assert.equal(run("$('roundCount').value"),'5');
run("selectCasinoPane('rules')");assert.equal(sidebar.dataset.pane,'rules');assert.equal(panes[2].getAttribute('aria-pressed'),'true');
console.log('Casino passed: 52 exact card faces, pip counts/court artwork, hidden next card, name validation, saved names, Ace high, push, win/bust, double-and-bank, repeated bank guard, turn advance, tied results, one finish/cloud write, reset and sidebar tabs.');


(async()=>{
 const backup=run('JSON.stringify({state,started,records})');
 let alerts=[];context.alert=message=>alerts.push(message);
 await elements.get('importFile').onchange({target:{files:[{text:async()=>backup}],value:'backup.json'}});
 assert.deepEqual(alerts,[],'An exported between-games backup must import');
 assert.equal(run('records.games'),1);assert.equal(run('state'),null);assert.equal(run('started'),false);
 console.log('PASS: between-games backup round trip preserves standings.');
})().catch(error=>{console.error(error);process.exitCode=1});

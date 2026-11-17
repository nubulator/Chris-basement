const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let keydown;const document={activeElement:null,addEventListener(type,fn){if(type==='keydown')keydown=fn},body:{dataset:{},style:{setProperty(){}}},getElementById(){return {addEventListener(){},replaceChildren(){},appendChild(){}}},createElementNS(){return {setAttribute(){},appendChild(){}}}};
const context=vm.createContext({document,Intl,Date,setInterval(){},URL,location:{href:'https://example.test/games.html'}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../game-room-lounge.js'),'utf8'),context);
const control=(x,y)=>({getBoundingClientRect(){return {left:x,right:x+100,top:y,bottom:y+80,width:100,height:80}},focus(){document.activeElement=this},scrollIntoView(){},matches(){return false}});
function check(columns){
 const controls=Array.from({length:8},(_,i)=>control((i%columns)*120,Math.floor(i/columns)*100));
 document.querySelectorAll=()=>controls;document.querySelector=()=>controls[0];document.activeElement=null;
 const press=key=>keydown({key,target:document.activeElement,preventDefault(){}});
 press('ArrowDown');assert.equal(document.activeElement,controls[0]);
 if(columns>1){press('ArrowRight');assert.equal(document.activeElement,controls[1]);press('ArrowLeft');assert.equal(document.activeElement,controls[0]);}
 press('ArrowDown');assert.equal(document.activeElement,controls[columns]);press('ArrowUp');assert.equal(document.activeElement,controls[0]);
 press('ArrowUp');assert.equal(document.activeElement,controls[0]);
 keydown({key:'ArrowDown',target:{matches:()=>true},preventDefault(){throw Error('Must preserve editing')}});assert.equal(document.activeElement,controls[0]);
}
[4,2,1].forEach(check);
console.log('PASS: lobby remote focus works across four, two and one-column layouts and preserves form editing.');

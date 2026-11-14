/* Chris's Basement overnight screensaver: midnight–7 AM America/New_York. */
(()=>{'use strict';
const KEY='chris.basement.overnightScreensaver.enabled';
const params=new URLSearchParams(location.search);
const enabled=()=>{try{return localStorage.getItem(KEY)!=='false'}catch{return true}};
const minutes=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return Number(parts.find(x=>x.type==='hour').value)*60+Number(parts.find(x=>x.type==='minute').value)};
const overnight=()=>minutes()<420;
const GRACE_MS=5000;
let graceUntil=Date.now()+GRACE_MS;
let countdownTimer=null;
function remaining(){return Math.max(0,Math.ceil((graceUntil-Date.now())/1000))}
function check(){if(Date.now()<graceUntil)return;if(enabled()&&overnight()&&!params.has('noScreensaver'))location.replace('./screensaver-studio.html?overnight=1&return='+encodeURIComponent('index-v3822.html'))}
function control(){
 const header=document.querySelector('header .header-right');
 if(!header || document.getElementById('overnightScreensaverToggle'))return;
 const actions=header.querySelector('.basement-header-actions');
 if(actions){while(actions.firstChild)header.insertBefore(actions.firstChild,actions);actions.remove()}
 const b=document.createElement('button');b.type='button';b.id='overnightScreensaverToggle';
 b.title='Toggle overnight screensaver (midnight–7 AM Eastern)';
 function label(){const on=enabled();b.textContent='🌙 Overnight: '+(on?'On'+(overnight()&&remaining()>0?' ('+remaining()+'s)':''):'Off');b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label','Overnight screensaver: '+(on?'On':'Off')+'. Midnight to 7 AM Eastern.')}
 label();b.onclick=()=>{try{localStorage.setItem(KEY,String(!enabled()))}catch{}label();check()};
 countdownTimer=setInterval(()=>{label();if(remaining()===0){clearInterval(countdownTimer);check()}},250);
 header.insertBefore(b,header.querySelector('#status'));
}

setTimeout(check,GRACE_MS+50);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',control,{once:true});else control();
setInterval(check,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();
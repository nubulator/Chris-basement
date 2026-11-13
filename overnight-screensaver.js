/* Chris's Basement overnight screensaver: midnight–7 AM America/New_York. */
(()=>{'use strict';
const KEY='chris.basement.overnightScreensaver.enabled';
const params=new URLSearchParams(location.search);
const enabled=()=>{try{return localStorage.getItem(KEY)!=='false'}catch{return true}};
const minutes=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return Number(parts.find(x=>x.type==='hour').value)*60+Number(parts.find(x=>x.type==='minute').value)};
const overnight=()=>minutes()<420;
function check(){if(enabled()&&overnight()&&!params.has('noScreensaver'))location.replace('./screensaver-studio.html?overnight=1&return='+encodeURIComponent('index-v3822.html'))}
function control(){const b=document.createElement('button');b.type='button';b.id='overnightScreensaverToggle';b.title='Toggle overnight screensaver (midnight–7 AM Eastern)';b.style.cssText='position:fixed;bottom:10px;right:10px;z-index:9999;background:#17283b;color:#fff;border:1px solid #65798d;border-radius:8px;padding:6px 10px;font:12px Arial;opacity:.7';function label(){b.textContent='🌙 Overnight screensaver: '+(enabled()?'On':'Off')}label();b.onclick=()=>{try{localStorage.setItem(KEY,String(!enabled()))}catch{}label();check()};document.body.appendChild(b)}
check();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',control,{once:true});else control();
setInterval(check,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();
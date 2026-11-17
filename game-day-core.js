function scoreValue(team){return typeof team.score==='object'?(team.score.displayValue??team.score.value??'—'):(team.score??'—')}

const cfg={bengals:{teamId:'4',name:'Cincinnati',cheer:'Who Dey!',url:'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100',test:/Cincinnati Bengals/i},browns:{teamId:'5',name:'Cleveland',cheer:'Go Browns!',url:'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100',test:/Cleveland Browns/i},osu:{teamId:'194',name:'Ohio State',cheer:'Go Bucks!',url:'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=80&limit=300',test:/Ohio State/i}};let selected='browns',current=null;const el=id=>document.getElementById(id);function fmt(t){return new Date(t).toLocaleString('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'})}function record(c){return(c.records||[]).find(x=>x.type==='total')?.summary||''}function updateField(e){const c=e?.competitions?.[0]||{},sit=e?.situation||c.situation||{},teams=c.competitors||[],poss=sit.possession||sit.possessionId||sit.possessionTeam?.id;const team=teams.find(t=>String(t.id)===String(poss)||String(t.team?.id)===String(poss));const down=sit.downDistanceText||[sit.down,sit.distance?'& '+sit.distance:''].filter(Boolean).join(' ');el('field-possession').textContent='BALL: '+(team?.team?.abbreviation||sit.possessionText||'NOT REPORTED');el('field-down').textContent=down||'DOWN / DISTANCE UNAVAILABLE';const yard=Number(sit.yardLine);const valid=Number.isFinite(yard)&&yard>=0&&yard<=100&&sit.yardLine!==undefined;el('field-ball').style.left=(valid?Math.max(3,Math.min(97,yard)):50)+'%';el('field-ball').style.opacity=valid?'1':'.4';const distance=Number(sit.distance),first=valid&&Number.isFinite(distance)&&distance>0?Math.min(97,yard+distance):null;el('field-first').style.display=first===null?'none':'block';if(first!==null)el('field-first').style.left=first+'%';el('field-foot').textContent=valid?'Field position from game feed • 10-second checks':'Field position unavailable • waiting for verified live data';}
const networkMarks={"FOX":"data:image/png;base64,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","CBS":"data:image/png;base64,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"};
const homeVenuePhotos={
 'Ohio Stadium':{
  image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ohio_Stadium_during_OSU_vs_Purdue_11-13-21.jpg/960px-Ohio_Stadium_during_OSU_vs_Purdue_11-13-21.jpg',
  source:'https://commons.wikimedia.org/wiki/File:Ohio_Stadium_during_OSU_vs_Purdue_11-13-21.jpg',credit:'Quintin Soloviev · CC BY 4.0'
 },
 'Huntington Bank Field':{
  image:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/FirstEnergy_Stadium_crowd_-_east.jpg/960px-FirstEnergy_Stadium_crowd_-_east.jpg',
  source:'https://commons.wikimedia.org/wiki/File:FirstEnergy_Stadium_crowd_-_east.jpg',credit:'Cards84664 · CC BY-SA 4.0'
 }
};
const venueAliases={'FirstEnergy Stadium':'Huntington Bank Field','Cleveland Browns Stadium':'Huntington Bank Field','Memorial Stadium (Lincoln, NE)':'Memorial Stadium (Lincoln)'};
const venuePhotos=new Map();
let activeVenue='';
function broadcastNames(competition){
 const names=[];
 const add=value=>{
  if(typeof value!=='string')return;
  for(const part of value.split(',')){
   const name=part.trim();
   if(name&&!names.some(entry=>entry.toUpperCase()===name.toUpperCase()))names.push(name);
  }
 };
 add(competition.broadcast);
 for(const entry of [...(competition.broadcasts||[]),...(competition.geoBroadcasts||[])]){
  if(/radio/i.test(entry.type?.shortName||''))continue;
  for(const name of entry.names||[])add(name);
  add(entry.media?.shortName);
 }
 return names;
}
function showBroadcast(competition){
 const names=broadcastNames(competition);
 const tv=el('tv');
 tv.textContent=names.join(' · ')||'Not listed';
 const key=names[0]?.toUpperCase();
 const logo=names.length===1&&networkMarks[key];
 const panel=tv.closest('.panel');
 if(logo)panel.style.setProperty('--network-logo','url("'+logo+'")');
 else panel.style.removeProperty('--network-logo');
}
function lookupVenuePhoto(name){
 const local=homeVenuePhotos[name];
 if(local)return Promise.resolve(local);
 if(!venuePhotos.has(name)){
  const params=new URLSearchParams({action:'query',format:'json',origin:'*',redirects:'1',prop:'pageimages',piprop:'thumbnail|name',pithumbsize:'960',titles:name});
  const request=fetch('https://en.wikipedia.org/w/api.php?'+params).then(r=>{
   if(!r.ok)throw Error('Venue lookup failed');
   return r.json();
  }).then(data=>{
   const page=Object.values(data.query?.pages||{})[0];
   if(!page?.thumbnail?.source||!page.pageimage)return null;
   const image=new URL(page.thumbnail.source);
   if(image.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(image.hostname))return null;
   image.search='';
   return {image:image.href,source:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(page.pageimage)};
  }).catch(()=>{
   venuePhotos.delete(name);
   return undefined;
  });
  venuePhotos.set(name,request);
 }
 return venuePhotos.get(name);
}
function showVenue(venue,pregame){
 const name=venue?.fullName||'';
 const text=el('venue'),panel=text.closest('.panel'),credit=el('venue-photo-credit');
 text.textContent=[name,venue?.address?.city].filter(Boolean).join(' · ')||'Not available';
 const key=pregame?(venueAliases[name]||name):'';
 if(key===activeVenue)return;
 activeVenue=key;
 panel.style.removeProperty('--venue-photo');
 credit.hidden=true;
 credit.removeAttribute('href');
 if(!key)return;
 lookupVenuePhoto(key).then(photo=>{
  if(activeVenue!==key)return;
  if(photo===undefined){activeVenue='';return;}
  if(!photo)return;
  panel.style.setProperty('--venue-photo','url('+JSON.stringify(photo.image)+')');
  credit.href=photo.source;
  credit.title=photo.credit||'Venue image and attribution';
  credit.hidden=false;
 });
}
function show(e){current=e;window.gameDayEvent=e;if(!e){document.body.classList.remove('game-live','game-final');el('live-field').hidden=true;el('status').textContent='No upcoming or recent game found';el('score').textContent='—';showVenue(null,false);showBroadcast({});return}const c=e.competitions?.[0]||{},a=c.competitors?.find(x=>x.homeAway==='away')||{},h=c.competitors?.find(x=>x.homeAway==='home')||{},s=e.status?.type||{},live=s.state==='in',done=s.state==='post';for(const [side,x] of [['away',a],['home',h]]){el(side).textContent=x.team?.shortDisplayName||x.team?.displayName||side.toUpperCase();el(side+'logo').src=x.team?.logo||x.team?.logos?.[0]?.href||'';el(side+'logo').alt=x.team?.displayName||'';el(side+'record').textContent=record(x)}document.body.classList.toggle('game-live',live);document.body.classList.toggle('game-final',done);window.gameDayInsiderRefresh?.();el('live-field').hidden=!live;if(live)updateField(e);el('score').textContent=live||done?scoreValue(a)+' – '+scoreValue(h):'VS';el('status').textContent=s.detail||s.description||'Scheduled';el('clock').textContent=live?'● LIVE':done?'FINAL':'UPCOMING';el('kickoff-label').textContent=live?'GAME CLOCK':done?'FINAL SCORE':'KICKOFF / GAME STATUS';el('countdown-label').textContent=live?'CURRENT PERIOD':done?'FINAL RESULT':'GAME DAY COUNTDOWN';el('situation-label').textContent=live?'POSSESSION / DOWN & DISTANCE':done?'GAME SUMMARY':'KEYS TO THE MATCHUP';el('detail-label').textContent=live?'LIVE GAME STATUS':done?'GAME STATUS':'PREGAME REPORT';el('kickoff').textContent=live?('Q'+(e.status?.period||'—')+' • '+(e.status?.displayClock||'Clock unavailable')):done?scoreValue(a)+' – '+scoreValue(h):fmt(e.date);showVenue(c.venue,!live&&!done);showBroadcast(c);const possession=e.situation?.possessionText||e.situation?.possession||c.situation?.possessionText||c.situation?.possession;const down=e.situation?.downDistanceText||c.situation?.downDistanceText;el('situation').textContent=live?([down,typeof possession==='string'&&possession.length<35?'Possession: '+possession:''].filter(Boolean).join(' • ')||'Live drive data unavailable'):done?'Game complete — final statistics coming soon':'See the rotating Insider for matchup analysis';el('detail').textContent=live?(s.detail||'Game in progress'):done?'Final • '+(s.detail||'Game completed'):'Latest matchup news and game notes in Insider';updateCountdown()}function updateCountdown(){if(!current)return;const state=current.status?.type?.state,diff=Math.max(0,new Date(current.date).getTime()-Date.now()),seconds=Math.floor(diff/1000),days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),mins=Math.floor(seconds%3600/60),secs=seconds%60;const pad=n=>String(n).padStart(2,'0');const countdown=el('countdown'),message=el('countdown-message');if(state==='in'){countdown.textContent='GAME ON';message.textContent='Follow the live scoreboard and drive information';return}if(state==='post'){countdown.textContent='FINAL';message.textContent='Final score and verified game statistics';return}countdown.textContent=(days?days+'d ':'')+pad(hours)+':'+pad(mins)+':'+pad(secs);const isOsu=selected==='osu';message.textContent=diff<=0?'Kickoff is here! Waiting for official game status.':diff<=5*60000?'Almost kickoff! Get to your seat.':diff<=15*60000?'Final call! Drinks, snacks, and remote ready.':diff<=30*60000?'30-minute warning: get those snacks lined up!':diff<=60*60000?'One hour to kickoff — pregame show time.':diff<=3*3600000?'Game day is getting close — '+cfg[selected].cheer:new Date(current.date).toLocaleDateString('en-CA',{timeZone:'America/New_York'})===new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'})?'IT’S GAME DAY! Make your snack plan.':diff<=24*3600000?'Tomorrow is game day — make your snack plan.':'Countdown to '+cfg[selected].name+' football';}
async function load(){const teamAtStart=selected;el('error').textContent='';try{let j={events:[]};try{const r=await fetch(cfg[teamAtStart].url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);j=await r.json()}catch(_){}const matches=(j.events||[]).filter(e=>e.competitions?.[0]?.competitors?.some(c=>cfg[teamAtStart].test.test(c.team?.displayName||'')));const now=Date.now(),H48=48*60*60*1000;const endTime=e=>{const t=e.status?.type?.completed?e.status?.type?.completedAt||e.status?.type?.endTime||e.status?.type?.date||e.status?.date:null;const parsed=t?Date.parse(t):NaN;return Number.isFinite(parsed)?parsed:Date.parse(e.date)+4*60*60*1000};const active=matches.filter(e=>e.status?.type?.state==='in');const recent=matches.filter(e=>e.status?.type?.state==='post'&&now-endTime(e)>=0&&now-endTime(e)<H48);const upcoming=matches.filter(e=>e.status?.type?.state==='pre'&&Date.parse(e.date)>=now-6*60*60*1000);active.sort((a,b)=>Math.abs(Date.parse(a.date)-now)-Math.abs(Date.parse(b.date)-now));recent.sort((a,b)=>endTime(b)-endTime(a));upcoming.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));let chosen=active[0]||recent[0]||upcoming[0];if(!chosen){try{const league=teamAtStart==='osu'?'college-football':'nfl',team=cfg[teamAtStart].teamId;const scheduleUrl='https://site.api.espn.com/apis/site/v2/sports/football/'+league+'/teams/'+team+'/schedule';const sr=await fetch(scheduleUrl,{cache:'no-store'});if(sr.ok){const sj=await sr.json();const teamEvents=(sj.events||[]).map(e=>({...e,status:e.status||e.competitions?.[0]?.status})).filter(e=>e.competitions?.[0]?.competitors?.some(c=>cfg[teamAtStart].test.test(c.team?.displayName||'')));const finished=teamEvents.filter(e=>e.status?.type?.state==='post'&&Date.parse(e.date)>now-72*60*60*1000).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));const ongoing=teamEvents.filter(e=>e.status?.type?.state==='in');const future=teamEvents.filter(e=>e.status?.type?.state==='pre'&&Date.parse(e.date)>now-6*60*60*1000).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));chosen=ongoing[0]||finished[0]||future[0]}}catch(_){}}if(!chosen){try{const league=teamAtStart==='osu'?'college-football':'nfl';const dates=[];for(let d=0;d<4;d++){const dt=new Date(now-d*86400000);dates.push(new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(dt).replace(/-/g,''))}for(const date of dates){const params=new URLSearchParams({dates,limit:'300'});params.set('dates',date);if(teamAtStart==='osu')params.set('groups','80');const response=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/'+league+'/scoreboard?'+params.toString(),{cache:'no-store'});if(!response.ok)continue;const data=await response.json();const games=(data.events||[]).filter(e=>e.competitions?.[0]?.competitors?.some(c=>cfg[teamAtStart].test.test(c.team?.displayName||'')));chosen=games.find(e=>e.status?.type?.state==='in')||games.filter(e=>e.status?.type?.state==='post').sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0];if(chosen)break}}catch(_){}}if(teamAtStart!==selected)return;show(chosen);el('updated').textContent=(chosen?'Updated ':'No game found · checked ')+new Date().toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})}catch(e){if(teamAtStart!==selected)return;el('error').textContent='Unable to refresh live data: '+e.message;el('updated').textContent='Data unavailable'}}function select(x){
 if(!cfg[x])return;
 selected=x;document.body.className=x;
 for(const k of Object.keys(cfg))el(k).classList.toggle('active',k===x);
 current=null;window.gameDayEvent=null;
 el('status').textContent='Finding the next matchup…';el('score').textContent='VS';el('clock').textContent='GAME DAY';
 for(const side of ['away','home']){el(side).textContent=side==='away'?cfg[x].name:'Opponent';el(side+'logo').removeAttribute('src');el(side+'record').textContent=''}
 el('countdown').textContent='—';el('countdown-message').textContent='Finding kickoff';el('live-field').hidden=true;
 el('weather-tile').textContent='Checking forecast…';showVenue(null,false);showBroadcast({});
 const url=new URL(location.href);url.searchParams.set('team',x);history.replaceState(null,'',url);
 window.dispatchEvent(new CustomEvent('gameday:team',{detail:x}));
 window.gameDayInsiderRefresh?.();load();
}
for(const key of Object.keys(cfg))el(key).onclick=()=>select(key);
el('refresh').onclick=()=>{const btn=el('refresh');btn.disabled=true;btn.textContent='RELOADING…';const url=new URL(window.location.href);url.searchParams.set('reload',String(Date.now()));url.searchParams.set('team',selected);window.location.replace(url.toString())};const requestedTeam=new URLSearchParams(window.location.search).get('team');if(cfg[requestedTeam]){selected=requestedTeam;document.body.className=selected;for(const key of Object.keys(cfg))el(key).classList.toggle('active',key===selected)}load();setInterval(()=>{if(current?.status?.type?.state==='in')load()},10000);setInterval(()=>{if(current?.status?.type?.state!=='in')load()},60000);setInterval(updateCountdown,1000);


(function(){
const originalShow=show;
show=function(e){
 originalShow(e);
 if(!e||e.status?.type?.state!=='in')return;
 const c=e.competitions?.[0]?.competitors||[];
 const a=c.find(x=>x.homeAway==='away')||{},h=c.find(x=>x.homeAway==='home')||{};
 const put=(id,v)=>{const n=document.getElementById(id);if(n)n.textContent=v};
 const score=x=>typeof x.score==='object'?(x.score.displayValue??'—'):(x.score??'—');
 for(const [side,x] of [['away',a],['home',h]]){
 put('period-'+side+'-abbr',x.team?.abbreviation||'—');
 put('period-'+side+'-points',score(x));
 const img=document.getElementById('period-'+side+'-logo');if(img&&x.team?.logo)img.src=x.team.logo;
 }
 put('period-quarter',e.status?.period?'Q'+e.status.period:'LIVE');
 put('period-clock',e.status?.displayClock||'—');
};
})();


(function(){
const originalShowV132=show;
show=function(e){
 const live=e?.status?.type?.state==='in';
 const board=document.getElementById('period-scoreboard');
 const score=document.querySelector('.hero .score');
 const original=document.getElementById('game-day-countdown-panel');
 if(board&&score&&original){
  if(live&&board.parentElement!==score)score.insertBefore(board,score.firstChild);
  else if(!live&&board.parentElement!==original)original.appendChild(board);
 }
 originalShowV132(e);
 if(!live)return;
 const c=e?.competitions?.[0]||{},sit=e?.situation||c.situation||{},teams=c.competitors||[];
 const possession=sit.possession||sit.possessionId||sit.possessionTeam?.id;
 const team=teams.find(t=>String(t.id)===String(possession)||String(t.team?.id)===String(possession));
 const ball=document.getElementById('field-ball');
 if(ball){
  let logo=document.getElementById('field-possession-logo');
  if(!logo){logo=document.createElement('img');logo.id='field-possession-logo';logo.alt='Possessing team';ball.appendChild(logo)}
  const url=team?.team?.logo;
  logo.style.display=url?'block':'none';
  if(url)logo.src=url;
  ball.title=team?.team?.displayName?'Possession: '+team.team.displayName:'Possession not reported';
 }
};
})();


(function(){const previous=show;show=function(e){previous(e);if(e?.status?.type?.state!=='in')return;const board=document.getElementById('period-scoreboard'),mid=board?.querySelector('.period-middle');if(!mid)return;
const q=document.getElementById('period-quarter'),clock=document.getElementById('period-clock');
const period=Number(e.status?.period||0);
if(q)q.textContent=period>=1&&period<=4?['FIRST QUARTER','SECOND QUARTER','THIRD QUARTER','FOURTH QUARTER'][period-1]:period>4?'OVERTIME':'LIVE';
if(clock)clock.textContent=e.status?.displayClock||'—';
let possession=mid.querySelector('#period-center-possession'),down=mid.querySelector('#period-center-down');
if(!possession){possession=document.createElement('div');possession.id='period-center-possession';possession.className='period-detail';mid.appendChild(possession)}
if(!down){down=document.createElement('div');down.id='period-center-down';down.className='period-detail';mid.appendChild(down)}
const competition=e.competitions?.[0]||{},situation=e.situation||competition.situation||{},teams=competition.competitors||[];
const id=situation.possession||situation.possessionId||situation.possessionTeam?.id;
const team=teams.find(t=>String(t.id)===String(id)||String(t.team?.id)===String(id));
const label=team?.team?.abbreviation||document.getElementById('field-possession')?.textContent?.replace(/^BALL:\s*/,'').trim()||'—';
possession.textContent='BALL: '+label;
const fieldDown=document.getElementById('field-down')?.textContent?.trim()||'';
down.textContent=fieldDown||situation.downDistanceText||'';
const sides=board.querySelectorAll('.team-situation');sides.forEach(n=>n.style.display='none');
};})();


(function(){
const prior=show;
show=function(e){prior(e);if(e?.status?.type?.state!=='in')return;
const surface=document.querySelector('#live-field .field-surface');if(!surface)return;
let overlay=surface.querySelector('.field-grid-v141');
if(!overlay){overlay=document.createElement('div');overlay.className='field-grid-v141';surface.appendChild(overlay);
const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1000 200');svg.setAttribute('preserveAspectRatio','none');
const line=(x,y1,x2,y2,width,opacity)=>{const l=document.createElementNS(NS,'line');for(const [k,v] of Object.entries({x1:x,y1,x2,y2,stroke:'#fff','stroke-width':width,opacity}))l.setAttribute(k,v);svg.appendChild(l)};
for(let i=0;i<=10;i++){const x=60+88*i;line(x,0,x,200,i===0||i===10?4:2.4,1)}
for(let i=1;i<50;i++){const x=60+17.6*i;if(i%5===0)continue;line(x,34,x,42,2.2,.94);line(x,158,x,166,2.2,.94)}
const nums=['','10','20','30','40','50','40','30','20','10',''];
for(let i=1;i<=9;i++){for(const y of [22,188]){const t=document.createElementNS(NS,'text');t.setAttribute('x',60+88*i);t.setAttribute('y',y);t.setAttribute('text-anchor','middle');t.setAttribute('fill','#fff');t.setAttribute('stroke','#102d14');t.setAttribute('stroke-width','2.8');t.setAttribute('paint-order','stroke');t.setAttribute('font-size','17');t.setAttribute('font-weight','900');t.textContent=nums[i];svg.appendChild(t)}}
overlay.appendChild(svg)}
// Keep the live feed's ball and first-down coordinates in the same field geometry as the yard lines.
for(const id of ['field-ball','field-first']){const n=document.getElementById(id);if(!n)continue;const raw=parseFloat(n.style.left);if(Number.isFinite(raw))n.style.left=(6+.88*raw)+'%'}
const tv=document.querySelector('.info-tv');if(tv){tv.querySelectorAll('img,svg').forEach(n=>{n.style.filter='brightness(0) invert(1)';n.style.opacity='1'})}
};
})();


(function(){
const previousShow=show;
show=function(e){previousShow(e);
if(e?.status?.type?.state!=='in')return;
const surface=document.querySelector('#live-field .field-surface'),marker=document.getElementById('field-first'),ball=document.getElementById('field-ball');if(!surface||!marker||!ball)return;
const sit=e.situation||e.competitions?.[0]?.situation||{},teams=e.competitions?.[0]?.competitors||[];
const possession=sit.possession||sit.possessionId||sit.possessionTeam?.id;
const offense=teams.find(t=>String(t.id)===String(possession)||String(t.team?.id)===String(possession));
const yard=Number(sit.yardLine),distance=Number(sit.distance);
if(sit.yardLine==null||sit.distance==null||!Number.isFinite(yard)||!Number.isFinite(distance)||distance<=0||!offense){marker.style.display='none';return}
// ESPN's yardLine is a fixed-field coordinate; direction depends on which team has possession.
// Away offense advances toward the left end zone; home offense toward the right.
const target=yard+(offense.homeAway==='away'?-distance:distance);
if(target<0||target>100){marker.style.display='none';return}
marker.style.left=(6+.88*target)+'%';marker.style.display='block';
};
})();

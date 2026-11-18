
(function(){
const $=id=>document.getElementById(id);let slide=0,token=0,details=null,loadedFor='',lastNews=null,detailsEventId='',lastGood={};
const names=['MATCHUP PREVIEW','INJURY REPORT','EXPERT PICKS & ODDS','PREGAME REPORT','SNACK OF THE GAME','FAN FEATURE'];
function opponent(e){const teams=e?.competitions?.[0]?.competitors||[];return teams.find(x=>!cfg[selected].test.test(x.team?.displayName||''))?.team||null}
function injuries(d){const groups=Array.isArray(d?.injuries)?d.injuries:[];let entries=[];for(const group of groups){if(Array.isArray(group?.injuries)){for(const p of group.injuries){entries.push({name:p.athlete?.displayName||p.athlete?.fullName||p.displayName,status:p.status||p.type?.description||p.details?.[0]?.status,photo:p.athlete?.headshot?.href||(p.athlete?.id?'https://a.espncdn.com/i/headshots/nfl/players/full/'+p.athlete.id+'.png':''),position:p.athlete?.position?.abbreviation||p.athlete?.position?.name||p.position?.abbreviation||''})}}else if(group?.athlete){entries.push({name:group.athlete.displayName,status:group.status||group.type?.description,photo:group.athlete?.headshot?.href||(group.athlete?.id?'https://a.espncdn.com/i/headshots/nfl/players/full/'+group.athlete.id+'.png':''),position:group.athlete?.position?.abbreviation||''})}}return entries.filter(x=>x.name&&x.status).slice(0,4)}

// Eleven Warriors is a supplemental Ohio State source. Each reviewed snapshot
// must include the game date, opponent, publication time and original article.
// Keep report dates separate from kickoff dates; never reuse across matchups.
const ELEVEN_WARRIORS = {
  home: 'https://www.elevenwarriors.com/ohio-state-football',
  reports: [{
    gameDate: '2026-11-14', opponent: 'Northwestern Wildcats',
    publishedAt: '2026-11-11T20:30:00-05:00',
    nextReportAt: '2026-11-12T20:00:00-05:00',
    label: 'Nov 11, 8:30 PM ET',
    url: 'https://www.elevenwarriors.com/ohio-state-football/2026/11/165364/injury-report-northwestern-quarterback-aidan-chiles-out-three-ohio-state-wide-receivers-listed-as-questionable',
    groups: [
      ['OUT', ['QB Julian Sayin', 'RB Ja’Kobi Jackson', 'S Deshawn Stewart', 'WR Brennen Schramm', 'OL Jaxon Powell', 'TE Max LeBlanc']],
      ['QUESTIONABLE', ['WR Brandon Inniss', 'WR Phillip Bell', 'WR Brock Boyd', 'S Terry Moore', 'LB Eli Lee', 'OL Deontae Armstrong', 'OL Max Riley']]
    ]
  }]
};
function elevenWarriorsReport(event, isOsu, now=Date.now()){
  if(!isOsu || event?.status?.type?.state!=='pre' || !Number.isFinite(Date.parse(event?.date)))return null;
  const teams=event.competitions?.[0]?.competitors||[];
  if(!teams.some(x=>/Ohio State/i.test(x.team?.displayName||'')))return null;
  const gameDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(event.date));
  const report=ELEVEN_WARRIORS.reports.find(r=>r.gameDate===gameDate&&teams.some(x=>x.team?.displayName===r.opponent)&&now>=Date.parse(r.publishedAt));
  if(!report || now>=Date.parse(event.date))return null;
  return {...report,older:now>=Date.parse(report.nextReportAt)};
}
function injurySourceLink(report){
  const link=document.createElement('a');
  link.href=report?.url||ELEVEN_WARRIORS.home;
  link.textContent=report?'Read report ↗':'Eleven Warriors updates ↗';
  link.target='_blank';link.rel='noopener noreferrer';
  link.className='injury-source-link';
  $('pregame-foot').append(document.createTextNode(' · '),link);
}
function showStats(){const e=window.gameDayEvent,state=e?.status?.type?.state,live=state==='in',post=state==='post';$('live-stats').hidden=!(live||post);$('insider-pregame').hidden=live||post;if(!(live||post))return;$('stats-heading').textContent=post?'FINAL GAME STATS':'LIVE STATS CENTER';$('stats-period').textContent=post?'FINAL':'Q'+(e.status?.period||'—')+' • '+(e.status?.displayClock||'');const box=details?.boxscore||{},groups=box.players||[],teams=box.teams||[],tiles=[];const categories=[['passing','PASSING'],['rushing','RUSHING'],['receiving','RECEIVING']];for(const [category,label] of categories){for(const group of groups){const section=(group.statistics||[]).find(x=>String(x.name||x.type||'').toLowerCase().includes(category));if(!section)continue;const labels=(section.labels||[]).map(x=>String(x).toUpperCase());let idx=labels.findIndex(x=>x==='YDS'||x==='YARDS');if(idx<0)idx=1;const athletes=(section.athletes||[]).filter(x=>!x.didNotPlay&&x.stats?.[idx]!==undefined).sort((x,y)=>(Number(y.stats[idx])||0)-(Number(x.stats[idx])||0));const athlete=athletes[0];if(!athlete)continue;const p=athlete.athlete||{};tiles.push({label:label+' YARDS',value:athlete.stats[idx],name:(p.shortName||p.displayName||'Player')+' • '+(group.team?.abbreviation||''),photo:p.headshot?.href||p.headshot?.url||null})}}
const getStat=(stats,aliases)=>{for(const name of aliases){const x=stats.find(v=>String(v.name||'').toLowerCase()===name.toLowerCase()||String(v.abbreviation||'').toLowerCase()===name.toLowerCase()||String(v.label||'').toLowerCase()===name.toLowerCase());if(x)return x.displayValue??x.value??null}return null};
const teamTiles=[];for(const team of teams){const stats=team.statistics||[],abbr=team.team?.abbreviation||'TEAM';const passing=getStat(stats,['netPassingYards','passingYards','netPassYds','passYds']);const rushing=getStat(stats,['rushingYards','rushYds']);if(passing!==null)teamTiles.push({label:'TEAM PASSING',value:passing,name:abbr,logo:team.team?.logo});if(rushing!==null)teamTiles.push({label:'TEAM RUSHING',value:rushing,name:abbr,logo:team.team?.logo})}
const combined=[...tiles.slice(0,6),...teamTiles.slice(0,4)];const grid=$('stats-tiles');grid.replaceChildren();if(!combined.length){const d=document.createElement('div');d.className='stats-empty';d.textContent=details?'ESPN has not supplied verified player and team statistics for this game.':loadedFor===e?.id?'ESPN game summary unavailable. Will retry automatically.':'Loading ESPN game statistics…';grid.append(d)}else for(const t of combined.slice(0,10)){const tile=document.createElement('div');tile.className='stat-tile';const imgUrl=t.photo||t.logo;if(imgUrl&&/^https:\/\//.test(imgUrl)){const img=document.createElement('img');img.className='stat-photo';img.alt='';img.loading='lazy';img.src=imgUrl;img.onerror=()=>img.remove();tile.append(img)}const body=document.createElement('div');body.className='stat-copy';for(const [cls,val] of [['stat-label',t.label],['stat-number',String(t.value)],['stat-player',t.name]]){const d=document.createElement('div');d.className=cls;d.textContent=val;body.append(d)}tile.append(body);grid.append(tile)}$('stats-foot').textContent=details?'ESPN game summary • stats update as published':'Waiting for ESPN game summary';}
function oddsCards(odd){if(!odd)return [];const cards=[];const spread=odd.details||odd.spreadDisplayValue;if(spread)cards.push(['SPREAD',String(spread)]);const total=odd.overUnder;if(total!==undefined&&total!==null&&Number.isFinite(Number(total)))cards.push(['OVER / UNDER',String(total)]);return cards;}
function render(){showStats();const e=window.gameDayEvent,opp=opponent(e),c=e?.competitions?.[0]||{},name=opp?.displayName||'opponent',city=opp?.location||name,indoor=c.venue?.indoor===true||details?.gameInfo?.venue?.indoor===true;const isOsu=selected==='osu',isBengals=selected==='bengals';$('fan-eyebrow').textContent=isOsu?'OHIO STATE FOOTBALL':isBengals?'CINCINNATI FOOTBALL':'CLEVELAND FOOTBALL';$('fan-title').textContent=isOsu?'BUCKEYE NATION':isBengals?'WHO DEY NATION':'THE DAWG POUND';$('fan-sub').textContent=isOsu?'SCARLET & GRAY':isBengals?'RULE THE JUNGLE':'SUNDAYS ARE FOR THE DAWGS';
const inj=injuries(details),odd=details?.pickcenter?.[0]||details?.odds?.[0]||c.odds?.[0],weather=details?.gameInfo?.weather||c.weather,wx=weather?.displayValue||weather?.temperature?(weather.displayValue||weather.temperature+'°'):'',snack=GameDaySnacks.select(opp,isOsu);
const picksForSaints=selected==='browns'&&/New Orleans Saints/i.test(name)&&e?.date?.slice(0,10)==='2026-11-08';const pickSource=picksForSaints?'Previously published NFL.com predictions • Not a live feed':'Named expert picks not yet verified for this matchup';
const rawNotes=[...(details?.news?.articles||[]),...(details?.header?.competitions?.[0]?.notes||[])];const target=isOsu?/\b(ohio state|buckeyes|ryan day|columbus|osu)\b/i:isBengals?/\b(cincinnati|bengals|burrow|who dey)\b/i:/\b(cleveland|browns|dawg pound|kevin stefanski)\b/i;const opponentName=(name||'').toLowerCase();const relevantNotes=rawNotes.filter(n=>{const t=[n.headline,n.shortHeadline,n.text,n.story,n.description].filter(Boolean).join(' ');return target.test(t)||t.toLowerCase().includes(opponentName)});const note=relevantNotes[0];const noteText=note?.headline||note?.shortHeadline||note?.text||'';const matchupNarrative=noteText||'';const gameReport=picksForSaints?'PREGAME STORY • Cleveland arrives at 5–3, while New Orleans is 2–5 and coming off a bye. The Saints remain in a tight NFC South race. Watch whether the Browns can protect the ball on the road and convert third downs.':'PREGAME STORY • '+(cfg[selected].name)+' faces '+name+'. The matchup could hinge on turnovers, third-down conversions and red-zone execution. Detailed verified game notes will replace this overview when available.';const injuryEntries=injuries(details);const availabilityReport=injuryEntries.length?null:elevenWarriorsReport(e,isOsu);const weatherLine=indoor?'Indoors · Controlled conditions':wx?wx:'Forecast unavailable';const pickList=picksForSaints?['Jeremy Bergman • NFL.com senior editor|Saints 21–16','Brooke Cersosimo • NFL.com senior staff editor|Saints 23–21','Gennaro Filice • NFL.com editor at large|Saints 26–17','Bobby Kownack • NFL.com digital producer|Saints 21–20','Dan Parr • NFL.com draft editor|Saints 24–20']:[];const injuryLines=availabilityReport?availabilityReport.groups.map(([status,players])=>[status+' ('+players.length+')',players.join('\n')]):injuryEntries.map(p=>[p.name+(p.position?' • '+p.position:''),p.status,p.photo]);const detailCards=slide===1?injuryLines:slide===2?[...oddsCards(odd),...pickList.map(x=>x.split('|'))]:slide===0?[['THE MATCHUP',(cfg[selected].name)+' vs '+name],['KEY BATTLE','Third-down efficiency and pressure on the quarterback'],['X-FACTOR','Turnovers and field position']]:slide===5?[['TRADITION',isOsu?'Script Ohio and the dotting of the i':isBengals?'The Who Dey chant echoes through the Jungle':'The Dawg Pound and its passionate fans'],['HISTORY',isOsu?'Ohio Stadium opened in 1922':isBengals?'Cincinnati began play in 1968':'Cleveland won the 1964 NFL championship'],['GAME DAY',isOsu?'Scarlet and gray in the Horseshoe':isBengals?'Orange, black and tiger stripes':'Orange helmets and barking from the stands']]:[];
const lines=[
[matchupNarrative,noteText?'ESPN • Team-relevant game preview':'Matchup keys • No verified preview article'],
[availabilityReport?'OHIO STATE AVAILABILITY REPORT':injuryEntries.length?'AVAILABLE PLAYER STATUS REPORT':'No verified injury statuses in ESPN game summary.',availabilityReport?'Eleven Warriors • '+availabilityReport.label+' • '+(availabilityReport.older?'Earlier report — check updates':'Dated report; not live'):'ESPN injury report • Updated when published'],
[pickList.length?'FIVE PUBLISHED NFL.COM PICKS':oddsCards(odd).length?'LATEST PUBLISHED ODDS':'Odds and analyst picks are not yet published.',oddsCards(odd).length?'ESPN published odds • Lines may change • '+pickSource:pickSource],
[gameReport,'Pregame details • Team-specific matchup information'],
[snack.name,(snack.matched?'Taste of the Opponent • ':'Tailgate House Favorite • ')+name],
[(isOsu?'BUCKEYE NATION':isBengals?'WHO DEY NATION':'THE DAWG POUND')+' • GAME DAY TRADITIONS','']
];$('pregame').dataset.slide=String(slide);const snackHost=$('snack-feature');snackHost.hidden=slide!==4;if(slide===4)GameDaySnacks.render(snackHost,snack);$('pregame-title').textContent=names[slide];$('pregame-body').textContent=lines[slide][0];$('pregame-body').hidden=slide===0&&!noteText;$('pregame-foot').textContent=lines[slide][1];$('pregame-foot').hidden=!lines[slide][1];if(slide===1&&isOsu)injurySourceLink(availabilityReport);$('slide-count').textContent=(slide+1)+' / '+names.length;const cards=$('insider-cards');cards.replaceChildren();cards.classList.toggle('injury-mode',slide===1&&injuryEntries.length>0);cards.hidden=!detailCards.length;cards.dataset.count=String(Math.min(6,detailCards.length));cards.dataset.availability=String(slide===1&&!!availabilityReport);for(const [heading,value,photo] of detailCards.slice(0,6)){const card=document.createElement('div');card.className='insider-card';const title=document.createElement('strong');title.textContent=heading;const detail=document.createElement('span');detail.textContent=value;if(slide===1&&photo){const img=document.createElement('img');img.className='injury-headshot';img.src=photo;img.alt='';img.loading='lazy';img.onerror=()=>img.remove();card.append(img)}card.append(title,detail);cards.append(card)}$('pregame-body').hidden=detailCards.length>0||slide===4;$('weather-tile').textContent=weatherLine;schedulePregameFit();
}
let fitFrame=0;
function schedulePregameFit(){
 if(fitFrame)return;
 fitFrame=requestAnimationFrame(()=>{
  fitFrame=0;
  if($('insider-pregame').hidden)return;
  const panel=$('pregame'),cards=$('insider-cards'),body=$('pregame-body');
  const boxes=cards.hidden?[body]:[...cards.children];
  const apply=scale=>panel.style.setProperty('--pregame-copy-scale',scale);
  const fits=()=>boxes.every(box=>box.scrollHeight<=box.clientHeight+1&&box.scrollWidth<=box.clientWidth+1);
  apply(1);
  if(fits())return;
  let lo=.64,hi=1;
  for(let i=0;i<6;i++){
   const mid=(lo+hi)/2;
   apply(mid);
   if(fits())lo=mid;else hi=mid;
  }
  apply(lo);
 });
}
window.addEventListener('resize',schedulePregameFit);
async function update(){const e=window.gameDayEvent;if(!e){++token;details=null;detailsEventId='';loadedFor='';render();return}if(detailsEventId!==e.id){details=lastGood[e.id]||null;detailsEventId=e.id}render();if(loadedFor===e.id)return;loadedFor=e.id;const n=++token;const league=document.body.classList.contains('osu')?'college-football':'nfl';const base='https://site.api.espn.com/apis/site/v2/sports/football/'+league+'/';try{const r=await fetch(base+'summary?event='+encodeURIComponent(e.id),{cache:'no-store'});if(!r.ok)throw Error('Summary unavailable');const j=await r.json();if(n!==token||window.gameDayEvent?.id!==e.id)return;if(j?.boxscore?.players?.length||j?.boxscore?.teams?.length){details=j;lastGood[e.id]=j}else if(!details){details=j}render()}catch(err){if(n!==token||window.gameDayEvent?.id!==e.id)return;loadedFor='';render()}}
window.gameDayInsiderRefresh=update;
$('slide-prev').onclick=()=>{slide=(slide+names.length-1)%names.length;render()};$('slide-next').onclick=()=>{slide=(slide+1)%names.length;render()};let paused=false;const pause=$('slide-pause');pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(paused))};setInterval(()=>{if(!paused){slide=(slide+1)%names.length;render()}},25000);
setInterval(()=>{if(window.gameDayEvent?.status?.type?.state==='in'){loadedFor='';update()}},20000);setInterval(()=>{if(window.gameDayEvent?.status?.type?.state!=='in'){loadedFor='';update()}},300000);
render();
})();

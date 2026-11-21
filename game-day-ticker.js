/* Standalone Game Day league ticker: Top 25 when OSU selected; all NFL for Browns/Bengals. */
(function(){
'use strict';
const host=document.getElementById('gd-ticker');
if(!host)return;
const label=host.querySelector('.gd-ticker-label');
const viewport=host.querySelector('.gd-ticker-viewport');
const nfl='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';
const college='https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=80&limit=300';
let requestId=0;
function selected(){const query=new URLSearchParams(location.search).get('team');return query==='osu'||query==='browns'||query==='bengals'?query:document.body.classList.contains('osu')?'osu':document.body.classList.contains('bengals')?'bengals':'browns'}
function score(x){const s=x?.score;return typeof s==='object'?(s.displayValue??s.value??'0'):(s??'0')}
function rank(x){const r=Number(x?.curatedRank?.current??x?.rank??x?.team?.rank);return Number.isInteger(r)&&r>=1&&r<=25?r:null}
function abbrev(x){return x?.team?.abbreviation||x?.team?.shortDisplayName||'TEAM'}
function localTime(date){return new Date(date).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' ET'}
function status(event){const st=event?.status||{},ty=st.type||{};if(ty.state==='post')return 'FINAL';if(ty.state==='in'){const quarter=Number(st.period)||0;const period=quarter>4?'OT':quarter?'Q'+quarter:'LIVE';return period+(st.displayClock&&st.displayClock!=='0:00'?' '+st.displayClock:'')};return event?.date?localTime(event.date):'SCHEDULED'}
function item(event,osu){const players=event?.competitions?.[0]?.competitors||[];if(players.length<2)return null;if(osu&&!players.some(p=>rank(p)!==null))return null;const away=players.find(p=>p.homeAway==='away')||players[0],home=players.find(p=>p.homeAway==='home')||players[1];const state=event?.status?.type?.state;const aRank=osu?rank(away):null,hRank=osu?rank(home):null;return {away:abbrev(away),home:abbrev(home),aRank,hRank,aScore:score(away),hScore:score(home),playing:state==='in'||state==='post',status:status(event),priority:state==='in'?0:state==='pre'?1:2,time:Date.parse(event.date)||0}}
function empty(message){viewport.replaceChildren();const node=document.createElement('span');node.className='gd-ticker-empty';node.textContent=message;viewport.append(node)}
function render(games){if(!games.length){empty('No games to display right now');return}const track=document.createElement('div');track.className='gd-ticker-track';function group(){const g=document.createElement('div');g.className='gd-ticker-group';for(const game of games){const div=document.createElement('span');div.className='gd-ticker-game';for(const [name,ranked,scoreText] of [[game.away,game.aRank,game.aScore],[game.home,game.hRank,game.hScore]]){const nameEl=document.createElement('strong');if(ranked)nameEl.className='gd-ranked';nameEl.textContent=(ranked?'#'+ranked+' ':'')+name+(game.playing?' '+scoreText:'');div.append(nameEl)}const s=document.createElement('span');s.className='gd-time';s.textContent=game.status;div.append(s);g.append(div)}return g}track.append(group(),group());viewport.replaceChildren(track);if(games.length<3)track.style.animationDuration='35s';else track.style.animationDuration=Math.max(35,games.length*9)+'s'}
async function refresh(){const id=++requestId,osu=selected()==='osu';label.textContent=osu?'TOP 25':'NFL SCORES';host.setAttribute('aria-label',osu?'Top 25 college football scores':'NFL scores');try{const res=await fetch(osu?college:nfl,{cache:'no-store'});if(!res.ok)throw Error('Scores unavailable');const data=await res.json();if(id!==requestId)return;const games=(data.events||[]).map(e=>item(e,osu)).filter(Boolean).sort((a,b)=>a.priority-b.priority||a.time-b.time);render(games)}catch(err){if(id===requestId)empty('Scores temporarily unavailable • retrying automatically')}}
refresh();setInterval(refresh,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();

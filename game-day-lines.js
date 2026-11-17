/* Both venues read the verified Daily Line cache maintained by Chris's Basement. */
(function(){
 const panel=document.getElementById('game-day-countdown-panel');
 const card=document.createElement('section');card.id='pregame-daily-line';card.setAttribute('aria-label','Daily Line for this matchup');
 card.innerHTML='<div class="daily-line-heading">DAILY LINE</div><div class="daily-line-values"><div><span>SPREAD</span><strong id="gdl-spread">—</strong></div><div><span>OVER / UNDER</span><strong id="gdl-total">—</strong></div></div><div id="gdl-source">Checking published lines…</div>';
 panel.append(card);let feed=null,failed=false;
 function render(){
  const event=window.gameDayEvent;card.hidden=event?.status?.type?.state!=='pre';if(card.hidden)return;
  const time=Date.parse(feed?.generatedAt),fresh=Number.isFinite(time)&&Date.now()-time<12*3600000&&time<Date.now()+300000;
  const game=fresh?feed.games?.find(g=>String(g.id)===String(event.id)&&g.state==='pre'&&['NFL','NCAA FOOTBALL'].includes(g.league)):null;
  const spread=typeof game?.odds?.spread==='string'&&game.odds.spread.trim()?game.odds.spread:'Not posted';
  const total=game?.odds?.total;const validTotal=total!==null&&total!==undefined&&Number.isFinite(Number(total));
  document.getElementById('gdl-spread').textContent=spread;document.getElementById('gdl-total').textContent=validTotal?String(total):'Not posted';
  document.getElementById('gdl-source').textContent=feed&&!fresh?'Daily Line awaiting a fresh update':game?'ESPN · '+new Date(time).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' ET'+(failed?' · Saved update':''):'Daily Line · '+(failed?'Temporarily unavailable':'Lines not yet posted for this matchup');
 }
 const previous=show;show=function(event){previous(event);render()};window.addEventListener('gameday:team',render);
 async function refresh(){try{const r=await fetch('https://nubulator.github.io/Chris-basement/data/daily-line-feed.json',{cache:'no-store'});if(!r.ok)throw Error('Feed unavailable');const next=await r.json();if(!Array.isArray(next.games)||!next.generatedAt)throw Error('Invalid feed');feed=next;failed=false}catch(_){failed=true}render()}
 render();refresh();setInterval(refresh,300000);
})();

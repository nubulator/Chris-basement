/* Saved shuffle bags: every question appears once before the next cycle. */
(function(root){
 'use strict';
 function shuffledIds(cards,random=Math.random){const ids=cards.map(c=>c.id);for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}return ids}
 function draw(cards,state,random=Math.random){
  const ids=new Set(cards.map(c=>c.id));
  let remaining=Array.isArray(state?.remaining)?state.remaining.filter(id=>ids.has(id)):[];
  if(new Set(remaining).size!==remaining.length)remaining=[];
  if(!remaining.length){remaining=shuffledIds(cards,random);if(remaining.length>1&&remaining[0]===state?.last)[remaining[0],remaining[1]]=[remaining[1],remaining[0]]}
  const id=remaining.shift();return {card:cards.find(c=>c.id===id),state:{remaining,last:id},position:cards.length-remaining.length};
 }
 if(typeof module==='object'&&module.exports){module.exports={draw,shuffledIds};return}
 const $=id=>document.getElementById(id),sets=root.GameDayTriviaData,states={},names={browns:'BROWNS',osu:'BUCKEYES',bengals:'BENGALS'};
 let active='',current,answer=false,timer;
 function team(){return document.body.classList.contains('osu')?'osu':document.body.classList.contains('bengals')?'bengals':'browns'}
 function state(key){if(states[key])return states[key];try{states[key]=JSON.parse(localStorage.getItem('gameday.trivia.v2.'+key))||{}}catch(_){states[key]={}}return states[key]}
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>answer?next():reveal(),answer?12000:18000)}
 function fitTrivia(){requestAnimationFrame(()=>{const panel=$('fan-trivia');panel.style.setProperty('--trivia-scale','1');for(let scale=.95;scale>=.74&&panel.scrollHeight>panel.clientHeight+1;scale-=.05)panel.style.setProperty('--trivia-scale',String(scale));})}
 root.addEventListener('resize',fitTrivia);
 function render(){if(!current)return;$('trivia-label').textContent=names[active]+' TRIVIA';$('trivia-question').textContent=current.card.q;$('trivia-answer').textContent=answer?current.card.a:'Reveal now or wait for the answer';$('trivia-answer').classList.toggle('revealed',answer);$('trivia-reveal').textContent=answer?'Answer shown':'Reveal answer';$('trivia-reveal').disabled=answer;$('trivia-progress').textContent=current.position+' / '+sets[active].length+' · Shuffled questions';fitTrivia();}
 function next(){active=team();current=draw(sets[active],state(active));states[active]=current.state;try{localStorage.setItem('gameday.trivia.v2.'+active,JSON.stringify(current.state))}catch(_){}answer=false;render();schedule()}
 function reveal(){answer=true;render();schedule()}
 function sync(){const key=team();for(const k of Object.keys(sets)){const button=$(k);button.classList.toggle('active',key===k);button.setAttribute('aria-pressed',String(key===k))}$('fan-team-logo').src='assets/game-day-premium/'+key+'-logo.png';if(key!==active)next()}
 $('trivia-next').onclick=next;$('trivia-reveal').onclick=reveal;root.addEventListener('gameday:team',sync);
 const host=$('dogg-pound'),countdown=document.querySelector('.info-countdown');countdown.id='game-day-countdown-panel';host.insertBefore(countdown,$('pregame'));
 function clock(){const now=new Date();$('header-time').textContent=now.toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'});$('header-date').textContent=now.toLocaleDateString('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric'})+' · ET'}
 // Return to the originating dashboard while keeping the two installations independent.
 clock();setInterval(clock,1000);sync();if(typeof ResizeObserver!=='undefined')new ResizeObserver(fitTrivia).observe($('dogg-sign'));
})(typeof window==='undefined'?globalThis:window);

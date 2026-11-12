(()=>{'use strict';
 const origin='https://bernie-bernie-family-card-night.nubulator.chatgpt.site';
 const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 let session=null,busy=false,creating=false,ack=null,paused=false,remotePlayer=null,notice=null;
 try{session=JSON.parse(sessionStorage.getItem('survey-phone-host')||'null');}catch{}
 const remember=()=>{try{sessionStorage.setItem('survey-phone-host',JSON.stringify(session));}catch{}};
 function view(){const live=started&&state;return {teams:live?state.teams:[$('team1').value.trim()||'Team One',$('team2').value.trim()||'Team Two'],question:live&&state.phase!=='done'?getQ().q:live?'Show complete!':'Waiting for the host to start the show.',phase:live?state.phase:'setup',turn:live?(state.phoneTurn||'restored-game'):'setup',active:live?(state.phase==='steal'?1-state.active:state.active):0,open:!!(live&&['play','steal'].includes(state.phase)&&$('resultOverlay').classList.contains('hidden')&&$('guessOverlay').classList.contains('hidden'))};}
 async function api(data){const response=await fetch(origin+'/api/survey',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.token},body:JSON.stringify({...data,code:session.code,requestId:random()})});let result;try{result=await response.json();}catch{throw Error('Phone server could not connect.');}if(!response.ok){const e=Error(result.error||'Phone connection unavailable.');e.status=response.status;throw e;}return result;}
 function showRoom(room){$('phoneCode').textContent=room.code;$('phoneRoom').classList.remove('hidden');$('phoneQR').classList.remove('hidden');const src=origin+'/api/survey-qr?code='+room.code;if($('phoneQR').getAttribute('src')!==src)$('phoneQR').src=src;$('phoneLink').href=origin+'/survey-phone.html?room='+room.code;$('enablePhones').classList.add('hidden');$('phonePlayers').textContent=room.players.length?room.players.map(p=>p.name+' ('+(p.team+1)+')').join(' · '):'Waiting for players…';$('phoneStatus').textContent='Scan the QR code. Choose your name and team.';}
 async function ensure(){if(creating||paused)return;if(session?.code){tick();return;}creating=true;$('enablePhones').disabled=true;$('phoneStatus').textContent='Opening phone keypads…';session={token:random(),code:''};remember();try{const room=await api({action:'create'});session.code=room.code;remember();showRoom(room);creating=false;tick();}catch(e){paused=true;$('phoneStatus').textContent=e.message+' TV controls still work.';$('enablePhones').classList.remove('hidden');}finally{creating=false;$('enablePhones').disabled=false;}}
 function consume(pending){
  if(!started||!state||pending.turn!==(state.phoneTurn||'restored-game'))return;
  state.phoneProcessed=state.phoneProcessed||[];
  if(state.phoneProcessed.includes(pending.id)){ack={id:pending.id,message:'Already checked. Watch the TV.'};return;}
  if(!$('resultOverlay').classList.contains('hidden')||!$('guessOverlay').classList.contains('hidden'))return;
  state.phoneProcessed.push(pending.id);state.phoneProcessed=state.phoneProcessed.slice(-80);
  remotePlayer=pending.player;
  $('guessOverlay').classList.remove('hidden');$('guessInput').value=pending.answer;$('guessFeedback').textContent='';$('reviewControls').classList.add('hidden');$('reviewChoices').classList.add('hidden');
  checkGuess({preventDefault(){}});
  const result=!$('resultOverlay').classList.contains('hidden');
  ack={id:pending.id,message:result?$('resultHeadline').textContent+' '+$('resultDetail').textContent:$('guessFeedback').textContent+' The host can review it on the TV.'};
  // Persist the receipt and scoring together. A repeated network delivery cannot score twice.
  save();
  if(!result)$('closeGuess').focus({preventScroll:true});
 }
 async function tick(){if(busy||creating||!session?.code||paused)return;busy=true;try{const sent=ack,sentNotice=notice;const room=await api({action:'sync',view:view(),...(sent?{ack:sent.id,message:sent.message}:{}),...(sentNotice?{notice:sentNotice}:{})});if(sent&&ack===sent)ack=null;if(sentNotice&&notice===sentNotice)notice=null;showRoom(room);if(room.pending)consume(room.pending);}catch(e){$('phoneStatus').textContent=e.message+' Reconnecting…';if(e.status===404){session=null;remember();paused=true;$('enablePhones').classList.remove('hidden');$('enablePhones').textContent='REOPEN PHONE KEYPADS';}}finally{busy=false;}}
 const showBoardResult=showResult;showResult=function(headline,detail,miss,after){showBoardResult(headline,detail,miss,after);if(remotePlayer){notice={player:remotePlayer,message:headline+' '+detail};remotePlayer=null;}};
 const closeBoardGuess=closeGuess;closeGuess=function(){closeBoardGuess();if(remotePlayer){notice={player:remotePlayer,message:'No points or strike added. Try a different wording.'};remotePlayer=null;}};$('closeGuess').onclick=closeGuess;
 $('enablePhones').onclick=()=>{paused=false;ensure();};
 const renderBoard=render;render=function(){renderBoard();if(started&&!paused)ensure();};
 setInterval(()=>{if(started&&!session&&!paused)ensure();else tick();},1200);
 if(session?.code||started)ensure();
})();

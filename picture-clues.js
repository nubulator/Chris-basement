/* Shared display only. Game engines own the deck, history, and score changes. */
window.createPictureClue = function({anchor,replace,getState}) {
 const box=document.createElement('figure');box.className='picture-clue';box.hidden=true;
 const img=document.createElement('img');img.alt='Picture clue';img.referrerPolicy='no-referrer';
 const status=document.createElement('p');status.className='picture-status';status.setAttribute('role','status');
 const credit=document.createElement('figcaption');
 const skip=document.createElement('button');skip.type='button';skip.className='secondary';skip.textContent='Use a text question instead';
 box.append(img,status,skip,credit);anchor.after(box);
 let current=null,phase='',timer=0,generation=0;
 function sync(){
  const s=getState(),revealed=!!s.revealed;
  document.getElementById('reveal').disabled=revealed||(!!current&&phase!=='ready');
  skip.hidden=!current||revealed||phase!=='failed';
  img.hidden=phase!=='ready';
  status.textContent=phase==='loading'?'Loading picture…':phase==='failed'?'This picture could not load. Replace it to keep playing.':'';
  credit.replaceChildren();
  if(current&&(revealed||current.license)){
   const text=document.createElement('span');text.textContent=current.credit+' ';credit.append(text);
   if(current.license){const link=document.createElement('a');link.href=current.license;link.target='_blank';link.rel='noopener';link.textContent='License';credit.append(link)}
   if(revealed){const link=document.createElement('a');link.href=current.source;link.target='_blank';link.rel='noopener';link.textContent=' · Image source';credit.append(link)}
  }
  img.alt=revealed&&current?current.a:'Picture clue';
 }
 skip.onclick=()=>{if(current&&phase==='failed'&&!getState().revealed)replace(current)};
 return function(q){
  const next=q?.image?q:null;box.hidden=!next;document.body.classList.toggle('has-picture',!!next);
  if(next?.id===current?.id){if(next)sync();return}
  generation++;clearTimeout(timer);img.onload=img.onerror=null;img.removeAttribute('src');current=next;
  if(!next){phase='';return}
  phase='loading';const token=generation;
  const settle=value=>{if(token!==generation)return;clearTimeout(timer);phase=value;sync()};
  img.onload=()=>settle(img.naturalWidth?'ready':'failed');img.onerror=()=>settle('failed');
  timer=setTimeout(()=>settle('failed'),12000);img.src=next.image;sync();
 };
};

/* Stadium weather fallback for Game Day. Open-Meteo: CC BY 4.0 (open-meteo.com). */
(function(){
'use strict';
let activeKey='', cachedText='', lastFetch=0, inFlight=false, generation=0;
const MAX_AGE=10*60*1000;
function textFor(code){
 const c=Number(code);
 if(c===0)return 'Clear';
 if(c===1)return 'Mostly Clear';
 if(c===2)return 'Partly Cloudy';
 if(c===3)return 'Overcast';
 if(c===45||c===48)return 'Foggy';
 if([51,53,55,56,57].includes(c))return 'Drizzle';
 if([61,63,65,66,67].includes(c))return 'Rain';
 if([71,73,75,77].includes(c))return 'Snow';
 if([80,81,82].includes(c))return 'Rain Showers';
 if([85,86].includes(c))return 'Snow Showers';
 if([95,96,99].includes(c))return 'Thunderstorms';
 return '';
}
function cityFor(e){
 const venue=e?.competitions?.[0]?.venue||{};
 const address=venue.address||{};
 const more=window.gameDayEvent?.competitions?.[0]?.venue?.address||{};
 return {city:address.city||more.city||'',region:address.state||''};
}
function notify(value){
 if(value===window.gameDayWeatherText)return;
 window.gameDayWeatherText=value;
 window.gameDayInsiderRefresh?.();
}
async function api(url){
 const ctl=new AbortController();
 const timeout=setTimeout(()=>ctl.abort(),9000);
 try{const r=await fetch(url,{signal:ctl.signal});if(!r.ok)throw Error('Weather service unavailable');return await r.json()}
 finally{clearTimeout(timeout)}
}
async function check(force=false){
 const event=window.gameDayEvent;
 const location=cityFor(event);
 const key=(event?.id||'')+'|'+location.city+'|'+location.region;
 if(key!==activeKey){activeKey=key;cachedText='';lastFetch=0;generation++;notify('')}
 if(!event||!location.city)return;
 const now=Date.now(),gameTime=Date.parse(event.date);
 if(event.status?.type?.state==='post' && now-gameTime>12*3600000)return;
 if(!force&&(inFlight||now-lastFetch<MAX_AGE))return;
 const run=++generation;inFlight=true;lastFetch=now;
 try{
  const search=new URL('https://geocoding-api.open-meteo.com/v1/search');
  search.searchParams.set('name',location.city);
  search.searchParams.set('count','10');
  search.searchParams.set('language','en');
  search.searchParams.set('countryCode','US');
  const geo=await api(search.toString());
  const places=geo.results||[];
  const place=places.find(x=>location.region&&[x.admin1,x.admin1_code].some(v=>v&&String(v).toLowerCase()===String(location.region).toLowerCase()))||places[0];
  if(!place)throw Error('Stadium city not found');
  const endpoint=new URL('https://api.open-meteo.com/v1/forecast');
  endpoint.searchParams.set('latitude',place.latitude);
  endpoint.searchParams.set('longitude',place.longitude);
  endpoint.searchParams.set('temperature_unit','fahrenheit');
  endpoint.searchParams.set('timezone','UTC');
  const live=event.status?.type?.state==='in';
  if(live)endpoint.searchParams.set('current','temperature_2m,weather_code');
  else endpoint.searchParams.set('hourly','temperature_2m,weather_code');
  const data=await api(endpoint.toString());
  if(run!==generation)return;
  let code,temp;
  if(live){code=data.current?.weather_code;temp=data.current?.temperature_2m}
  else {
   const hourly=data.hourly||{};
   const timestamps=hourly.time||[];
   let ix=-1,best=Infinity;
   for(let i=0;i<timestamps.length;i++){
    const delta=Math.abs(Date.parse(timestamps[i]+'Z')-gameTime);
    if(delta<best){ix=i;best=delta}
   }
   if(ix<0||best>90*60*1000)throw Error('Kickoff forecast outside range');
   code=hourly.weather_code?.[ix];temp=hourly.temperature_2m?.[ix];
  }
  const condition=textFor(code);
  if(!condition)throw Error('Weather condition missing');
  cachedText=(Number.isFinite(Number(temp))?Math.round(Number(temp))+'° · ':'')+condition;
  notify(cachedText);
 }catch(_){if(run===generation)notify('')}
 finally{if(run===generation)inFlight=false}
}
window.addEventListener('gameday:team',()=>{generation++;inFlight=false;activeKey='';notify('');setTimeout(()=>check(true),0)});
setInterval(()=>check(),15000);
setTimeout(()=>check(),1000);
})();

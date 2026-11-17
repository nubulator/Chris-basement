(function (global) {
 'use strict';
 const endpoint='https://bernie-bernie-family-card-night.nubulator.chatgpt.site/api/sports';
 const espnOrigin='https://site.api.espn.com', prefix='/apis/site/v2/sports/';
 const nativeFetch=global.fetch.bind(global);
 async function sportsFetch(input,options={}){
  const url=new URL(input,global.location.href);
  if(url.origin!==espnOrigin||!url.pathname.startsWith(prefix))return nativeFetch(input,options);
  const relay=new URL(endpoint);relay.search=url.search;relay.searchParams.set('path',url.pathname.slice(prefix.length));
  const response=await nativeFetch(relay.href,{...options,credentials:'omit',signal:options.signal||AbortSignal.timeout(12000)});
  if(response.ok){
   const at=response.headers.get('X-Sports-Fetched-At');
   if(at)api.lastFetchedAt=at;
  }
  return response;
 }
 function publishedOdds(data,league=''){
  const list=x=>Array.isArray(x)?x:x&&typeof x==='object'?[x]:[];
  const candidates=[...list(data?.pickcenter),...list(data?.odds),...list(data?.header?.competitions?.[0]?.odds),...list(data?.competitions?.[0]?.odds)];
  const value=x=>{if(x==null)return null;if(typeof x==='object')return value(x.displayValue??x.value);const s=String(x).trim();return !s||/^(?:Unavailable|Pending|Not published|—|--|NaN)$/i.test(s)?null:s};
  const competitors=data?.competitions?.[0]?.competitors||data?.header?.competitions?.[0]?.competitors||[];
  const home=competitors.find(x=>x.homeAway==='home')?.team?.abbreviation||'';
  const puck=/^(NHL|MLB)$|hockey\/nhl|baseball\/mlb/i.test(league);
  let line=null,total=null;
  for(const o of candidates){
   const abbr=home||o.homeTeamOdds?.team?.abbreviation||'';
   const homeLine=value(o.pointSpread?.home?.close?.line);
   let spread=puck?null:value(o.details);
   if(spread===null&&abbr&&homeLine!==null)spread=abbr+' '+homeLine;
   if(spread===null&&abbr&&value(o.spread)!==null&&Number.isFinite(Number(o.spread)))spread=abbr+' '+(Number(o.spread)>=0?'+':'')+Number(o.spread);
   line=line??spread;
   const raw=value(o.overUnder)??value(o.over_under)??value(o.total?.over?.close?.line)??value(o.total?.under?.close?.line);
   const number=raw===null?NaN:Number(raw.replace(/^[ou]\s*/i,''));
   if(total===null&&Number.isFinite(number)&&number>0)total=String(number);
   if(line!==null&&total!==null)break;
  }
  return line!==null||total!==null?'LINE: '+(line??'Unavailable')+' • O/U: '+(total??'Unavailable'):'';
 }
 const api={fetch:sportsFetch,publishedOdds,lastFetchedAt:null};global.IsonSports=api;
})(window);

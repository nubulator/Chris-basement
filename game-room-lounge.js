/* Premium lobby: navigation and existing seasonal lights only. */
document.getElementById('refreshPage').addEventListener('click',()=>{
 const url=new URL(location.href);url.searchParams.set('refresh',Date.now().toString());location.replace(url);
});
function roomTheme(date=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date);
 const value=t=>Number(parts.find(p=>p.type===t).value);
 const y=value('year'),m=value('month'),d=value('day'),today=Date.UTC(y,m-1,d),day=86400000;
 const themes={winter:['Winter nights','Stay cozy','❄️','🌲','#a4d9ef','#243b55'],spring:['Hello spring','Fresh starts','🌷','🦋','#edb4cf','#3b5260'],summer:['Summer nights','Good times','☀️','🌴','#f4c365','#275663'],fall:['Autumn nights','Gather & play','🍁','🍂','#e7a44b','#713e29'],newyear:['Happy New Year','One more round','🎆','🥂','#e9ce81','#34304d'],valentine:['Happy Valentine’s','Love & luck','💝','♥️','#ef96ac','#6d243f'],patrick:['Lucky nights','Feeling lucky','☘️','🌈','#93d491','#1e563d'],easter:['Happy Easter','Hello spring','🐣','🌷','#dfb2e9','#554770'],july:['Happy Fourth','Stars & stripes','🇺🇸','🎆','#a9c9ff','#563444'],halloween:['Happy Halloween','Fright night','🎃','👻','#f0a04d','#432545'],thanksgiving:['Give thanks','Gather together','🦃','🍂','#e8b775','#653c28'],christmas:['Merry Christmas','Merry & bright','🎄','🎁','#9fd3ae','#663331']};
 const events=[];
 const add=(year,month,date,key)=>events.push({at:Date.UTC(year,month-1,date),key});
 for(const year of [y-1,y,y+1]){
  [[1,1,'newyear'],[2,14,'valentine'],[3,17,'patrick'],[7,4,'july'],[10,31,'halloween'],[12,25,'christmas']].forEach(([a,b,k])=>add(year,a,b,k));
  const first=new Date(Date.UTC(year,10,1)).getUTCDay();add(year,11,1+(4-first+7)%7+21,'thanksgiving');
  const a=year%19,b=Math.floor(year/100),c=year%100,h=(19*a+b-Math.floor(b/4)-Math.floor((b-Math.floor((b+8)/25)+1)/3)+15)%30,l=(32+2*(b%4)+2*Math.floor(c/4)-h-c%4)%7,n=Math.floor((a+11*h+22*l)/451),p=h+l-7*n+114;
  add(year,Math.floor(p/31),p%31+1,'easter');
 }
 const holiday=events.filter(e=>today>=e.at-14*day&&today<=e.at).sort((a,b)=>a.at-b.at)[0];
 const key=holiday?holiday.key:m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'fall':'winter';
 return {key,art:themes[key]};
}
const lightPalettes={halloween:['#ff7a16','#a95aff','#86d934'],christmas:['#f44940','#49b960','#ffdc8b'],july:['#ff4949','#fff8e8','#448cff'],newyear:['#fff1c0','#dcc0ff'],valentine:['#ff6f8f','#ffe9d0'],patrick:['#5ada78','#ffe4a2']};
let displayedTheme='';
function drawHolidayLights(key){
 const svg=document.getElementById('holidayLights'),ns='http://www.w3.org/2000/svg';
 svg.replaceChildren();
 const colors=lightPalettes[key]||['#ffd18b','#ffe8b9','#efba6f'];
 const make=(tag,attrs,parent=svg)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.appendChild(e);return e};
 // Uneven hanging spans are stable between refreshes; only the glow gently varies.
 const defs=make('defs',{});
 colors.forEach((color,i)=>{const gradient=make('radialGradient',{id:'bulbHalo'+i},defs);make('stop',{offset:'0%','stop-color':color,'stop-opacity':.7},gradient);make('stop',{offset:'100%','stop-color':color,'stop-opacity':0},gradient)});
 const spans=[[-25,4,490,43],[490,8,1110,54],[1110,3,1580,39],[1580,6,2025,48]];
 let index=0;
 spans.forEach(([x0,y0,x1,sag])=>{
  make('path',{d:`M${x0} ${y0} Q${(x0+x1)/2} ${sag*2} ${x1} 6`,fill:'none',stroke:'#100f0c','stroke-width':3});
  const count=Math.round((x1-x0)/48);
  for(let i=0;i<count;i++){
   const t=(i+.35+(i%3)*.09)/count,x=(1-t)*(1-t)*x0+2*(1-t)*t*(x0+x1)/2+t*t*x1,y=(1-t)*(1-t)*y0+2*(1-t)*t*sag*2+t*t*6;
   const colorIndex=index++%colors.length,color=colors[colorIndex],angle=(i%5-2)*7;
   const g=make('g',{transform:`translate(${x} ${y}) rotate(${angle})`,class:'bulb-twinkle',style:`--delay:-${(index*1.37)%9}s;--twinkle-speed:${(3.2+(index*7%17)/5).toFixed(1)}s`});
   make('line',{x1:0,y1:0,x2:0,y2:6,stroke:'#181a13','stroke-width':2},g);
   make('ellipse',{cx:0,cy:14,rx:20,ry:23,fill:`url(#bulbHalo${colorIndex})`},g);
   make('rect',{x:-3,y:4,width:6,height:5,rx:1,fill:'#25301e'},g);
   make('ellipse',{cx:0,cy:14,rx:4.4,ry:6.8,fill:color,class:'bulb-core'},g);
   make('ellipse',{cx:-1,cy:12,rx:1.2,ry:2.8,fill:'#fff9e0',opacity:.8},g);
  }
 });
}
function updateRoomTheme(){
 const {key,art}=roomTheme();
 if(key===displayedTheme)return;
 displayedTheme=key;document.body.dataset.season=key;
 document.body.style.setProperty('--season-glow',art[4]);
 drawHolidayLights(key);
}
updateRoomTheme();setInterval(updateRoomTheme,60000);

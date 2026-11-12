(function(root){
 'use strict';
 const groups={
  'Shovel driveway':['shovel','shoveling','shovelling','shovel snow','clear snow','clear driveway','snow blower','snowblow','snow removal'],
  'Build snowman':['snowman','snow man','snowmen','make a snowman','building a snowman','frosty'],
  'Sled':['sledding','go sledding','sledding in snow','toboggan','tobogganing','sleigh ride'],
  'Drink cocoa':['cocoa','hot cocoa','hot chocolate','drink hot chocolate'],
  'Stay inside':['indoors','inside','stay home','stay in','stay indoors','go inside','remain indoors','stay in the house'],
  'Drinks':['drink','beverages','water','bottled water','soda','pop','beer','juice','lemonade'],
  'Utensils':['silverware','cutlery','fork','forks','spoon','spoons','knife','knives','forks and spoons'],
  'Watch TV':['tv','television','watch television','watch a show'],
  'Watch television':['tv','television','watch tv','watch a show'],
  'Look at phone':['phone','check phone','scroll phone','text','texting'],
  'Check phone':['phone','look at phone','check messages','texting'],
  'Phone':['cell phone','cellphone','mobile phone','iphone'],
  'Remote control':['remote','tv remote','controller'],
  'Take pictures':['photos','pictures','photograph','photography','take photos'],
  'Clean house':['clean','cleaning','tidy up','vacuum','dust'],
  'Prepare food':['cook','cooking','make food','make dinner'],
  'Get a snack':['snack','eat','eating','get food'],
  'Comfort pets':['calm dog','calm the dog','comfort dog','comfort cat','reassure pets'],
  'Check weather':['weather','forecast','radar','weather app','check forecast'],
  'Unplug electronics':['unplug','unplug appliances','disconnect electronics'],
  'Take off shoes':['shoes','remove shoes','kick off shoes'],
  'Check the mail':['mail','get mail','mailbox'],
  'Change clothes':['clothes','get changed','put on pajamas'],
  'Use bathroom':['bathroom','restroom','toilet','pee'],
  'Bathroom stops':['bathroom','restroom','toilet','bathroom breaks'],
  'Traffic':['traffic jam','congestion','stuck in traffic'],
  'Car trouble':['breakdown','broken down','flat tire','car broke down'],
  'Bad weather':['rain','storm','snow','thunderstorm'],
  'Soda':['pop','soft drink','coke','pepsi'],
  'Coins':['change','loose change','money'],
  'Lawn mower':['mower','lawnmower'],
  'Gifts':['presents','present'],
  'Greet pets':['pet dog','greet dog','say hi to dog'],
  'Cheer':['cheering','celebrate','celebrating'],
  'Cheering':['cheer','cheers','celebrating'],
  'Jump up':['jump','jumping'],
  'Dance':['dancing'],
  'Dancing':['dance'],
  'Shout':['shouting','yell','yelling'],
  'Barks':['bark','barking'],
  'Jumps':['jump','jumping'],
  'Wags tail':['wag','wagging','tail wagging'],
  'Listen to music':['music','listen to songs','headphones'],
  'Movie theater':['cinema','movies'],
  'Phone charger':['charger','charging cable','phone cable'],
  'Passport or ID':['passport','id','identification','drivers license'],
  'Medication':['medicine','meds','pills']
 };
 const stop=new Set(('a an the my your some i we they people would might usually think say it is its to go going do doing on in at of for with and during get getting make making build building take taking').split(' '));
 const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 function stem(w){if(w==='snowmen')return 'snowman';if(w.endsWith('ies')&&w.length>4)return w.slice(0,-3)+'y';if(w.endsWith('ing')&&w.length>5){w=w.slice(0,-3);if(/([b-df-hj-np-tv-z])\1$/.test(w))w=w.slice(0,-1);return w;}if(w.endsWith('ed')&&w.length>4)return w.slice(0,-2);if(w.endsWith('s')&&!w.endsWith('ss')&&w.length>3)return w.slice(0,-1);return w;}
 const tokens=s=>[...new Set(norm(s).split(' ').filter(w=>w&&!stop.has(w)).map(stem))];
 function distance(a,b){let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row;}return prev[b.length];}
 function near(a,b){if(a===b)return true;if(Math.min(a.length,b.length)<4)return false;return distance(a,b)<=(Math.min(a.length,b.length)>=7?2:1);}
 function match(input,question,extra={}){
  const guess=norm(input),words=tokens(input);
  const literal=question.answers.findIndex(a=>norm(a.text)===guess);if(literal>=0)return {index:literal,reason:'exact'};
  if(!words.length||words.some(w=>['not','never','no','dont'].includes(w)))return {index:-1,reason:'review'};
  const answers=question.answers.map(({text},index)=>{
   const variants=[text,...(groups[text]||[]),...(extra[text]||[])];
   if(text==='Stay inside'&&/thunderstorm|storm|snowy/i.test(question.q))variants.push('take shelter','seek shelter','take cover','go to the basement','basement','go downstairs','intake shelter');
   const score=Math.max(...variants.map(v=>{
    if(norm(v)===guess)return v===text?110:100;
    const target=tokens(v);if(!target.length)return 0;
    if(words.length===target.length&&words.every(w=>target.includes(w)))return 94;
    if(words.every(w=>target.some(t=>near(w,t))))return words.every(w=>target.includes(w))?88:82;
    // Permit small conversational additions, but do not accept a list of different guesses.
    return 0;
   }));
   return {index,score};
  });
  const high=Math.max(...answers.map(a=>a.score));if(!high)return {index:-1,reason:'review'};
  const best=answers.filter(a=>a.score>=high-5);
  if(best.length!==1)return {index:-2,reason:'ambiguous'};
  return {index:best[0].index,reason:high>=94?'exact':'close'};
 }
 const api={match,norm,tokens};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SurveyMatcher=api;
})(typeof globalThis!=='undefined'?globalThis:this);

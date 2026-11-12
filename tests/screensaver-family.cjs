const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../screensaver-family.js'),'utf8').replace(/^import .*;\n/gm,'');
const elements=new Map(),updates=[],links=[],listeners=[],writes=[],timeouts=[];
let onAuth;
const auth={currentUser:null};
const context={console,URL,Uint8Array,Date,Set,Promise,
 document:{getElementById:id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);}},
 window:{StudioFamily:{update:records=>updates.push(records),setLink:url=>links.push(url)},addEventListener(){}},
 initializeApp:()=>({}),getApps:()=>[],getAuth:()=>auth,getFirestore:()=>({}),
 onAuthStateChanged:(a,fn)=>onAuth=fn,
 doc:(db,...parts)=>parts.join('/'),collection:(db,path)=>path,
 onSnapshot:(path,next,error)=>{const item={path,next,error,active:true};listeners.push(item);return()=>item.active=false;},
 setDoc:async(path,data)=>writes.push({path,data}),Timestamp:{fromMillis:millis=>({millis})},
 signInAnonymously:async()=>{auth.currentUser={uid:'test-screen',isAnonymous:true};onAuth(auth.currentUser);},
 crypto:require('node:crypto').webcrypto,
 setTimeout:(fn,delay)=>{timeouts.push({fn,delay});return timeouts.length;},clearTimeout:()=>{},
 location:{reload:()=>{}},
};
vm.runInNewContext(source,context);
const latest=path=>listeners.filter(x=>x.path===path&&x.active).at(-1);
(async()=>{
 onAuth(null);assert.equal(listeners.length,0);
 await elements.get('connectFamily').onclick();
 const device=latest('familyHubDevices/test-screen');assert.ok(device);
 device.next({exists:()=>false});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(writes.length,1);assert.equal(writes[0].path,'familyHubPairing/test-screen');
 assert.match(writes[0].data.code,/^[A-HJ-NP-Z2-9]{8}$/);
 assert.equal(new URL(links.at(-1)).searchParams.get('code'),writes[0].data.code);
 assert.equal(new URL(links.at(-1)).searchParams.get('photos'),'1');
 assert.equal(latest('familyHub/main/events'),undefined,'unapproved screen must not subscribe to photos');
 device.next({exists:()=>true});
 const photos=latest('familyHub/main/events');assert.ok(photos);
 photos.next({docs:[
 {id:'family',data:()=>({people:'ison-family-moment:v1',name:'Test family photo',photo:'data:image/jpeg;base64,AAAA'})},
 {id:'calendar',data:()=>({people:'Beth',photo:'data:image/jpeg;base64,AAAA'})},
 {id:'external',data:()=>({people:'ison-family-moment:v1',photo:'https://invalid.example/photo.jpg'})}
 ]});assert.equal(updates.at(-1).length,1);assert.equal(updates.at(-1)[0].type,'family');
 device.next({exists:()=>false});assert.equal(photos.active,false);assert.equal(updates.at(-1).length,0,'revoked screens clear private photos');
 auth.currentUser=null;onAuth(null);photos.next({docs:[{id:'late',data:()=>({people:'ison-family-moment:v1',photo:'data:image/jpeg;base64,AAAA'})}]});assert.equal(updates.at(-1).length,0,'late snapshot cannot restore signed-out photos');
 auth.currentUser={uid:'unapproved-user',email:'unknown@example.com',emailVerified:true,isAnonymous:false};onAuth(auth.currentUser);assert.equal(latest('familyHub/main/events'),undefined);
 auth.currentUser={uid:'family-user',email:'nubulator@gmail.com',emailVerified:true,isAnonymous:false};onAuth(auth.currentUser);assert.ok(latest('familyHub/main/events'));
 console.log('PASS: pairing, QR destination, approved-screen access, gallery filtering, revocation, stale snapshots and family sign-in');
})().catch(error=>{console.error(error);process.exitCode=1;});

import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInAnonymously} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,doc,onSnapshot,setDoc,Timestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
// Reuse the Family Hub's auth session and existing approved-screen permissions.
const app=getApps().find(app=>app.name==='[DEFAULT]')||initializeApp({apiKey:'AIzaSyBbN4Qm-sTtoUE9HNEhjeNlibBKo5dPSs8',authDomain:'chris-game-room.firebaseapp.com',projectId:'chris-game-room',appId:'1:705590637292:web:306ac6b6e13e269a1c2bc9'});
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
const family=new Set(['nubulator@gmail.com','ison915@gmail.com']);
const uploadUrl='https://isonfamilyhome.com/?photos=1';
let stopDevice,stopPhotos,expiryTimer,pending=false,requested=false,approved=false,activeCode='',generation=0,connectionFailed=false;
function status(text){$('familySyncStatus').textContent=text;}
function clearPhotos(){stopPhotos?.();stopPhotos=null;window.StudioFamily.update([]);}
function resetLink(){clearTimeout(expiryTimer);activeCode='';window.StudioFamily.setLink(uploadUrl);$('pairCodeText').hidden=true;$('uploadHelp').textContent='Scan the QR code, sign in with your family Google account, then choose your photos. They join your shared Family & pets collection.';}
function subscribePhotos(user,token){
 if(stopPhotos)return;
 approved=true;resetLink();$('connectFamily').hidden=true;status('Connected · Loading shared family photos…');
 stopPhotos=onSnapshot(collection(db,'familyHub/main/events'),snapshot=>{
  if(token!==generation||auth.currentUser?.uid!==user.uid)return;
  const photos=snapshot.docs.map(doc=>({...doc.data(),id:doc.id}))
   .filter(event=>event.people==='ison-family-moment:v1'&&/^data:image\/(jpeg|png|webp);base64,/.test(event.photo||''))
   .map(event=>({type:'family',title:event.name||'Family moment',src:event.photo}));
  window.StudioFamily.update(photos);
  status(`Connected · ${photos.length} shared family ${photos.length===1?'photo':'photos'}. New uploads appear automatically.`);
 },()=>{
  if(token!==generation)return;
  clearPhotos();approved=false;connectionFailed=true;$('connectFamily').hidden=false;status('Family photo connection interrupted. Refresh to reconnect.');$('connectFamily').textContent='Refresh connection';
 });
}
async function pairingCode(){
 const user=auth.currentUser;
 if(!user?.isAnonymous||approved||pending)return;
 pending=true;$('connectFamily').disabled=true;const token=generation;
 try{
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code=Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>chars[n%chars.length]).join('');
  await setDoc(doc(db,'familyHubPairing',user.uid),{code,expiresAt:Timestamp.fromMillis(Date.now()+9*60000)});
  if(token!==generation||approved)return;
  clearTimeout(expiryTimer);activeCode=code;
  const url=new URL(uploadUrl);url.searchParams.set('approve','1');url.searchParams.set('code',code);
  window.StudioFamily.setLink(url.href);
  $('pairCodeText').textContent='SCREEN CODE: '+code;$('pairCodeText').hidden=false;
  $('uploadHelp').textContent='Scan the QR code or open the link on this iPad. Sign in, approve this screen once, then add your photos. The screen code fills in automatically.';
  status('Waiting for approval · This code is valid for 9 minutes.');$('connectFamily').textContent='Get a new code';
  expiryTimer=setTimeout(()=>{if(activeCode!==code)return;resetLink();status('Screen code expired. Choose Get a new code, then scan again.');},9*60000);
 }catch{status('Could not connect this screen. Check the internet connection and try again.');}
 finally{pending=false;$('connectFamily').disabled=false;}
}
onAuthStateChanged(auth,user=>{
 const token=++generation;stopDevice?.();stopDevice=null;clearPhotos();resetLink();approved=false;$('connectFamily').hidden=false;
 if(!user){status('Connect this screen once to show your shared family photos.');return;}
 if(!user.isAnonymous){
  if(user.emailVerified&&family.has(user.email))subscribePhotos(user,token);
  else{status('This account cannot view the family photos. Open the Family Hub and sign in with an approved family account.');$('connectFamily').hidden=true;}
  return;
 }
 stopDevice=onSnapshot(doc(db,'familyHubDevices',user.uid),snapshot=>{
  if(token!==generation)return;
  if(snapshot.exists()){subscribePhotos(user,token);return;}
  clearPhotos();approved=false;$('connectFamily').hidden=false;
  if(requested&&!activeCode)pairingCode();
  else if(!activeCode)status('Connect this screen once to show your shared family photos.');
 },()=>{if(token!==generation)return;clearPhotos();approved=false;connectionFailed=true;resetLink();$('connectFamily').hidden=false;status('Screen approval could not be checked. Refresh to reconnect.');$('connectFamily').textContent='Refresh connection';});
});
$('connectFamily').onclick=async()=>{
 if(connectionFailed){location.reload();return;}
 requested=true;
 try{
  status('Preparing your secure screen connection…');
  if(!auth.currentUser)await signInAnonymously(auth);
  else if(auth.currentUser.isAnonymous)await pairingCode();
  else if(auth.currentUser.emailVerified&&family.has(auth.currentUser.email))subscribePhotos(auth.currentUser,generation);
 }catch{status('Could not connect this screen. Check the internet connection and try again.');}
};


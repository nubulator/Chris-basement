/* Rebuildable ESPN response cache, kept out of game/name localStorage. */
(() => {
  'use strict';
  const PREFIX = 'basement.espn.v1.', MAX_BYTES = 12 * 1024 * 1024, MAX_ITEMS = 32, TTL = 48 * 3600000;
  const result = r => new Promise((yes,no) => { r.onsuccess=()=>yes(r.result); r.onerror=()=>no(r.error); });
  const done = t => new Promise((yes,no) => { t.oncomplete=yes; t.onabort=()=>no(t.error||Error('Cache write aborted')); t.onerror=()=>{}; });
  let connection;
  function database() {
    if (!connection) connection = (async()=>{
      const r=indexedDB.open('chris-sports-response-cache-v1',1);
      r.onupgradeneeded=()=>r.result.createObjectStore('responses');
      const db=await result(r);db.onversionchange=()=>{db.close();connection=null;};return db;
    })().catch(e=>{connection=null;throw e;});
    return connection;
  }
  async function read(key) {
    const db=await database(),t=db.transaction('responses','readonly'),finished=done(t);
    const value=await result(t.objectStore('responses').get(key));await finished;return value;
  }
  async function put(key, value) {
    if (!key.startsWith(PREFIX)) throw Error('Invalid sports cache key');
    const size=JSON.stringify(value).length*2;
    if(size>MAX_BYTES)return false;
    const db=await database(),t=db.transaction('responses','readwrite'),finished=done(t),s=t.objectStore('responses');
    s.put({...value,bytes:size},key);
    const rows=[];const cursor=s.openCursor();
    cursor.onsuccess=()=>{
      const c=cursor.result;
      if(c){if(!c.value.at||Date.now()-c.value.at>TTL)c.delete();else rows.push({key:c.key,at:c.value.at,bytes:c.value.bytes||JSON.stringify(c.value).length*2});c.continue();}
      else{rows.sort((a,b)=>b.at-a.at);let used=0;rows.forEach((row,i)=>{used+=row.bytes;if(i>=MAX_ITEMS||used>MAX_BYTES)s.delete(row.key);});}
    };
    await finished;return true;
  }
  let migration;
  function migrate() {
    if (!migration) migration=(async()=>{
      const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(PREFIX))keys.push(k);}
      for(const key of keys){
        const raw=localStorage.getItem(key);let value;try{value=JSON.parse(raw);}catch(_){continue;}
        // Expired network responses are disposable, never game/user records.
        if(value&&Number.isFinite(value.at)&&Date.now()-value.at>TTL){if(localStorage.getItem(key)===raw)localStorage.removeItem(key);continue;}
        if(!value||!value.at||!value.data)continue;
        await put(key,value);const saved=await read(key);
        if(saved&&saved.at===value.at&&JSON.stringify(saved.data)===JSON.stringify(value.data)&&localStorage.getItem(key)===raw)localStorage.removeItem(key);
      }
    })().catch(e=>{migration=null;throw e;});
    return migration;
  }
  window.BasementSportsCache={
    migrate,
    async get(key){await migrate();const v=await read(key);return v&&Date.now()-v.at<TTL?v:null;},
    async set(key,value){await migrate();return put(key,value);}
  };
  migrate().catch(()=>{});
})();


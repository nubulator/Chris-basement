/* Shared scores use the existing default Firebase session; local saves stay local. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GameRoomCloud = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const MAX_PAYLOAD = 200000;
  const games = new Set(['euchre', 'casino', 'music', 'trivia', 'survey']);
  function encode(data) {
    const key = Object.hasOwn(data, 'state') ? 'state' : 'standings';
    if (!data[key] || typeof data[key] !== 'object' || Array.isArray(data[key])) throw Error('Invalid shared scores.');
    const payload = JSON.stringify({[key]: data[key]});
    if (new TextEncoder().encode(payload).length > MAX_PAYLOAD) throw Error('Shared scores are too large. Your local scores are safe; export a backup.');
    return {schemaVersion: 1, payload, updatedAt: data.updatedAt};
  }
  function decode(data) {
    if (!data || !Object.hasOwn(data, 'schemaVersion')) return data; // Existing scores remain readable.
    if (data.schemaVersion !== 1 || typeof data.payload !== 'string' || new TextEncoder().encode(data.payload).length > MAX_PAYLOAD) throw Error('Invalid shared score format.');
    const result = JSON.parse(data.payload);
    if (!result || typeof result !== 'object' || Array.isArray(result) || Object.keys(result).length !== 1 || !['state','standings'].includes(Object.keys(result)[0])) throw Error('Invalid shared score format.');
    return result;
  }
  function connect(config, game, status, onReady) {
    if (!games.has(game)) throw Error('Unknown game.');
    const app = firebase.apps.find(a => a.name === '[DEFAULT]') || firebase.initializeApp(config);
    const auth = app.auth(), db = app.firestore(), ref = db.collection('gameRoom').doc(game);
    const panel = document.createElement('div'), signIn = document.createElement('button'), message = document.createElement('span');
    panel.className = 'game-cloud-access';
    signIn.type = 'button'; signIn.textContent = 'Family sign-in for shared scores';
    message.setAttribute('role', 'status'); panel.append(signIn, message); status.insertAdjacentElement('beforebegin', panel);
    let canWrite = false, revision = 0;
    signIn.onclick = async () => {
      signIn.disabled = true;
      try { await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
      catch { message.textContent = 'Sign-in did not finish. Local play and saves are still available.'; }
      finally { signIn.disabled = false; }
    };
    auth.onAuthStateChanged(async user => {
      const current = ++revision; canWrite = false;
      signIn.hidden = !!user && !user.isAnonymous;
      if (!user) { message.textContent = 'Local play is ready. Sign in to load or publish shared scores.'; return; }
      try {
        if (!user.isAnonymous && user.emailVerified) {
          // Server rules, rather than public email addresses, decide family membership.
          await db.collection('isonMobile/main/recipes').limit(1).get({source:'server'});
          if (current !== revision) return;
          canWrite = true;
        }
        if (current !== revision) return;
        message.textContent = canWrite ? 'Family account connected for shared scores.' : 'Connected screen: shared scores are read-only; new scores stay on this device.';
        await onReady();
      } catch {
        if (current === revision) { canWrite = false; message.textContent = 'Shared scores are unavailable for this account. Your local saves are safe.'; signIn.hidden = false; }
      }
    });
    function assertWriter() { if (!canWrite) throw Error('Family Google sign-in is required to publish shared scores. Local scores are safe.'); }
    return {ref, db, decode,
      set(data) { assertWriter(); return ref.set(encode(data)); },
      transaction(update) { assertWriter(); return db.runTransaction(async tx => {
        assertWriter(); const snap = await tx.get(ref);
        const next = await update(snap.exists ? decode(snap.data()) : null);
        assertWriter(); tx.set(ref, encode(next));
      }); }
    };
  }
  return {connect, encode, decode, MAX_PAYLOAD};
});

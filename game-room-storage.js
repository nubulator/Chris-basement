/* Larger local game storage. Only explicitly configured keys are migrated. */
(function () {
  'use strict';
  const DEFAULT_DB = 'chris-game-room-storage-v1';
  function request(req) {
    return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
  }
  function complete(tx) {
    return new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onabort = () => reject(tx.error || new Error('Save cancelled')); tx.onerror = () => {}; });
  }
  async function open(keys, options = {}) {
    const legacy = options.legacy || window.localStorage;
    const notify = options.notify || (() => {});
    const opening = indexedDB.open(options.database || DEFAULT_DB, 1);
    opening.onupgradeneeded = () => {
      opening.result.createObjectStore('values');
      opening.result.createObjectStore('legacyBackups');
    };
    opening.onblocked = () => notify('Close other Game Room tabs to finish opening storage.', true);
    const db = await request(opening);
    db.onversionchange = () => { db.close(); notify('Storage updated in another tab. Reload this page.', true); };
    const cache = new Map(), versions = new Map(), pending = new Map();
    let saving = null, failure = null, closed = false, legacyConflict = false;
    const snapshots = keys.map(key => [key, legacy.getItem(key)]);
    // Archive original strings and migrate absent values in one atomic commit.
    const tx = db.transaction(['values', 'legacyBackups'], 'readwrite');
    const committed = complete(tx);
    for (const [key, old] of snapshots) {
      const get = tx.objectStore('values').get(key);
      get.onsuccess = () => {
        const current = get.result;
        if (old !== null) {
          tx.objectStore('legacyBackups').put({ key, value: old, migratedAt: new Date().toISOString() }, key + ':' + Date.now() + ':' + Math.random());
          if (!current) tx.objectStore('values').put({ value: old, revision: 1 }, key);
          else if (current.value !== old) legacyConflict = true;
        }
      };
    }
    await committed;
    // Read back the durable values AND archives before reclaiming localStorage.
    const verify = db.transaction(['values', 'legacyBackups'], 'readonly');
    const verified = complete(verify);
    const reads = keys.map(key => request(verify.objectStore('values').get(key)));
    const archivesRead = request(verify.objectStore('legacyBackups').getAll());
    const values = await Promise.all(reads), archives = await archivesRead;
    await verified;
    snapshots.forEach(([key, old], i) => {
      const row = values[i]; cache.set(key, row ? row.value : null); versions.set(key, row ? row.revision : 0);
      if (old !== null && row && archives.some(a => a.key === key && a.value === old) && legacy.getItem(key) === old) {
        // Changed old-tab records stay available in the migration archive.
        legacy.removeItem(key);
      }
    });
    function check(key) { if (!cache.has(key)) throw new Error('Unmanaged storage key: ' + key); if (closed) throw new Error('Storage is closed'); }
    async function commitBatch(batch) {
      const t = db.transaction('values', 'readwrite'), done = complete(t), store = t.objectStore('values');
      let conflict = false;
      for (const [key, value] of batch) {
        const get = store.get(key);
        get.onsuccess = () => {
          const revision = get.result ? get.result.revision : 0;
          if (revision !== versions.get(key)) { conflict = true; t.abort(); return; }
          store.put({ value, revision: revision + 1 }, key);
        };
      }
      try { await done; } catch (e) { if (conflict) throw new Error('Another tab changed this game. Export this tab's backup before reloading.'); throw e; }
      for (const [key] of batch) versions.set(key, versions.get(key) + 1);
    }
    function drain() {
      if (saving) return saving;
      saving = (async () => {
        while (pending.size) {
          const batch = new Map(pending); pending.clear(); notify('Saving.', false);
          try { await commitBatch(batch); }
          catch (e) {
            for (const [k, v] of batch) if (!pending.has(k)) pending.set(k, v);
            failure = e; notify('Not saved: ' + e.message + ' - export a backup or retry.', true); throw e;
          }
        }
        failure = null; notify(legacyConflict ? 'Saved. Older-tab records preserved in backup archive.' : 'Saved on this device', false);
      })().finally(() => { saving = null; });
      return saving;
    }
    function write(key, value) {
      check(key); cache.set(key, value); pending.set(key, value);
      // Internal rejection is displayed; flush() still rejects for navigation.
      drain().catch(() => {});
    }
    const api = {
      getItem(key) { check(key); return cache.get(key); },
      setItem(key, value) { write(key, String(value)); },
      removeItem(key) { write(key, null); },
      flush: drain,
      get dirty() { return !!(pending.size || saving || failure); },
      async backup() {
        const t = db.transaction('legacyBackups', 'readonly'), done = complete(t);
        const all = await request(t.objectStore('legacyBackups').getAll()); await done;
        return { format: 'chris-game-room-storage-backup-v1', exportedAt: new Date().toISOString(), values: Object.fromEntries(cache), legacyBackups: all.filter(a => keys.includes(a.key)) };
      },
      close() { closed = true; db.close(); }
    };
    notify(legacyConflict ? 'Older-tab records preserved in backup archive.' : 'Saved on this device', false);
    return api;
  }
  function download(data) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'game-room-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  async function boot(keys, options = {}) {
    const panel = document.createElement('details');
    panel.style.cssText = 'position:fixed;bottom:4px;right:8px;z-index:99999;max-width:min(580px,90vw);max-height:75vh;overflow:auto;background:#18251f;color:#fff;padding:7px 12px;border:1px solid #baa370;border-radius:8px;font:13px system-ui';
    panel.innerHTML = '<summary style="cursor:pointer">Opening saved game.</summary><p>Expanded device storage � IndexedDB</p><p data-capacity></p><button type="button" data-export>Export storage backup</button> <button type="button" data-retry>Retry save</button> <button type="button" data-persist>Protect offline saves</button><p data-note>Keep a backup of important scores. Clearing browser site data removes device saves.</p>';
    document.body.append(panel);
    const summary = panel.querySelector('summary');
    const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:#111d;color:#fff;display:grid;place-items:center;font:20px system-ui'; overlay.textContent = 'Opening your saved game.'; document.body.append(overlay);
    const note = panel.querySelector('[data-note]');
    try {
      const storage = await open(keys, { ...options, notify(message, error) { summary.textContent = message; if (error) panel.open = true; } });
      window.GameRoomStorage.store = storage;
      panel.querySelector('[data-export]').onclick = async () => { try { download(await storage.backup()); } catch(e) { note.textContent = 'Backup failed: ' + e.message; } };
      panel.querySelector('[data-retry]').onclick = () => storage.flush().catch(() => {});
      const restoreLabel = document.createElement('label'); restoreLabel.textContent = ' Restore storage backup: ';
      const restore = document.createElement('input'); restore.type = 'file'; restore.accept = '.json,application/json'; restoreLabel.append(restore); panel.append(restoreLabel);
      restore.onchange = async () => {
        try {
          if (!restore.files[0]) return;
          const data = JSON.parse(await restore.files[0].text());
          if (data.format !== 'chris-game-room-storage-backup-v1' || !data.values || typeof data.values !== 'object') throw new Error('Choose an exported storage backup.');
          const entries = Object.entries(data.values).filter(([k]) => keys.includes(k));
          if (!entries.length || entries.some(([,v]) => v !== null && typeof v !== 'string')) throw new Error('This backup does not match this game.');
          if (!confirm('Replace this game's device saves with this backup? Export the current backup first if you want to keep both.')) return;
          for (const [k,v] of entries) v === null ? storage.removeItem(k) : storage.setItem(k,v);
          await storage.flush(); location.reload();
        } catch(e) { note.textContent = 'Restore failed: ' + e.message; }
        restore.value = '';
      };
      panel.querySelector('[data-persist]').onclick = async () => {
        try { const ok = navigator.storage && navigator.storage.persist && await navigator.storage.persist(); note.textContent = ok ? 'Persistent storage enabled. Keep exported backups too.' : 'Browser did not grant persistence. Saves still work; keep exported backups.'; } catch(e) { note.textContent = e.message; }
      };
      if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(e => {
        panel.querySelector('[data-capacity]').textContent = 'Browser estimate for this site: ' + (e.usage / 1048576).toFixed(1) + ' MB used of ' + (e.quota / 1048576).toFixed(0) + ' MB available allowance. Shared with other pages on this site.';
      }).catch(() => {});
      window.addEventListener('beforeunload', e => { if (storage.dirty) { e.preventDefault(); e.returnValue = ''; } });
      document.addEventListener('click', async e => {
        const anchor = e.target.closest('a[href]'), refresh = e.target.closest('#pageRefresh');
        if (!storage.dirty || (!anchor && !refresh) || (anchor && (anchor.target === '_blank' || anchor.getAttribute('href').startsWith('#')))) return;
        e.preventDefault(); e.stopImmediatePropagation();
        try { await storage.flush(); if (refresh) location.reload(); else location.href = anchor.href; } catch (_) {}
      }, true);
      for (const source of document.querySelectorAll('script[type="application/x-game-storage"]')) {
        const script = document.createElement('script'); script.textContent = source.textContent; document.body.append(script);
      }
      overlay.remove();
    } catch (e) {
      summary.textContent = 'Saved game could not be opened'; panel.open = true;
      overlay.textContent = 'Storage unavailable. Your existing records have not been reset. Reload to retry.';
      note.textContent = e.message;
      panel.querySelector('[data-retry]').onclick = () => location.reload();
      panel.querySelector('[data-export]').onclick = () => {
        const values = {}; keys.forEach(k => { values[k] = localStorage.getItem(k); }); download({ format: 'legacy-game-backup', values });
      };
    }
  }
  window.GameRoomStorage = { open, boot };
})();


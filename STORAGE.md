# Game Room device storage

Music Challenge, Trivia Tavern, and High Stakes Casino use `game-room-storage.js` and IndexedDB database `chris-game-room-storage-v1`.

## Startup and migration

Only each page's explicit key allowlist is touched. The original JSON strings are archived in `legacyBackups` and copied into `values` in one transaction. The transaction must complete, and the values and archive must be read back, before matching old localStorage copies are removed. Other sites' data, dashboards, and login records are untouched. Game scripts remain inert until storage is ready; no blank default game starts on a storage-open failure.

## Saves

The existing game engine uses a synchronous memory view while writes are serialized to IndexedDB. The status changes to Saved only after transaction completion. Failed pending writes remain in memory and can be exported or retried. Refresh, links, and the Fire TV Back handler await saves; browser closure while saves are pending triggers a warning where supported. A per-key revision check rejects stale-tab writes. Close old game tabs before upgrading.

Records written by an old version after migration are archived on next launch; the newer IndexedDB record stays active. Export storage backup includes both current values and original migration archives. The Restore storage backup input restores the current values from that export, with confirmation. Existing game-specific record exports/imports remain available.

## Capacity

IndexedDB uses the browser-managed site quota, not localStorage's approximately 5 MiB quota. No fixed capacity is promised. The storage panel shows `navigator.storage.estimate()` for the entire origin. Protect offline saves requests persistence; the browser can decline. This does not provide cross-device sync or protect against clearing site data. Existing shared leaderboards continue to use their existing cloud backend.

## Validation

Use isolated test database names and synthetic records for migration, >5 MiB saves, reload persistence, deletion tombstones, rapid saves, unavailable storage, and stale-tab conflict rejection. Integration preview pages must remove cloud startup scripts and use isolated keys/databases. Never commit synthetic scores to production standings.

The sports dashboard uses `sports-cache.js`, a separate rebuildable IndexedDB cache capped at 12 MiB, 32 responses, and 48 hours. Matching old ESPN cache entries are reclaimed after verification, or once expired. Other localStorage keys are never removed by cache maintenance.

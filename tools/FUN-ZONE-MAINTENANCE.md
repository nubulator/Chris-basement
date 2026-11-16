# Fun Zone daily content

Production entry: `index-v3822.html`. The V119 daily catalog is in `fun-zone-daily.js`; rebuild it from the reviewed JSON files instead of editing the bundle.

## Daily behavior

- Dates always use `America/New_York`, including daylight saving time.
- The classic rock deck contains 400 distinct songs. A fixed shuffle advances once per Eastern calendar day, without resetting at New Year. No song repeats within a complete 400-day cycle.
- Keep the catalog length, order, and shuffle seed stable during routine maintenance. Correct a clue, answer, or source in its existing slot. Adding or reordering songs changes the schedule and needs an explicit migration to preserve the current cycle.
- The question and answer come from the same daily selection on every device. Refreshing the page or pressing Next does not choose another song.
- History is indexed by `MM-DD`, including February 29. Every record's `sourceDate` must agree with its key. Missing or mismatched data produces an unavailable message; there is no general-fact fallback.
- History cards show the calendar date and year, with a source link. Source attribution and verification limits are recorded in `data/history-sources.md` and `data/lyrics-sources.md`.
- The existing nine slides, 25-second rotation, text fitting, and band marks are retained. The first clue is held for at least 25 seconds after a midnight reset. Waking or restoring a tab checks the date immediately.

## Updating content

1. Edit `data/classic-rock-lyrics.json` or `data/history-calendar.json`. Confirm the exact lyric wording/song/artist or the historical month/day/year against a reliable source. Keep quoted lyric excerpts to at most 10 words, and keep each song represented only once. History copy should be concise and factual.
2. Run `node tools/build-fun-zone.cjs`.
3. Run `node tools/build-fun-zone.cjs --check` and `node --test tests/fun-zone.test.cjs tests/fun-zone-ui.test.cjs`.
4. For an asset update, increment the script URL's version query and the visible dashboard version together. Check the clue, history card, answer, and Next control in the rendered dashboard.

The date tests cover normal/leap years, century leap rules, Eastern midnight, both daylight-saving transitions, device time zones, and a complete no-repeat cycle. UI tests execute the production Fun Zone script with a controlled clock and DOM harness, including sleeping/resumed tabs and missing-data behavior. Pixel layout still needs a browser check; these tests do not simulate an LG TV or physical Fire TV remote.

Keep baseline recovery branches unchanged. This content update applies only to Chris's Basement.

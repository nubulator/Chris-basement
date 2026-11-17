# Picture clue maintenance

The optional bank is in picture-bank.js. Trivia and Music use stable, separate IDs.
Current starter pack: 8 Trivia pictures and 10 Music pictures (8 artist photographs and 2 album covers).
Images are externally hosted and require internet; the interface offers a text replacement on a failed image load.

## Adding fresh clues
- Append entries; never change an existing ID to mean a different image/question.
- Verify the image loads and visually check it does not print the answer.
- Keep an HTTPS image URL, source page, credit, and any license URL. Do not label copyrighted album artwork public domain.
- Music entries require level and tags; category/difficulty selections apply to picture clues.
- Increment the picture-bank.js version in trivia.html and music.html when updating the bank.
- Existing used-picture history survives new bank releases and page refreshes. History is local to each browser, with the existing game export/import backup mechanism.
- Trivia never recycles pictures automatically; Music also never recycles pictures automatically. If the unused matching bank is exhausted, use regular questions.
- This is a curated repository bank, not an automatic image search or external trivia-image feed. Refresh downloads new published entries; it does not generate new entries.
- No-repeat history relies on browser storage succeeding. Do not clear game storage without a backup and user approval.

## Checks
Validate deck sizes at 25/50, no duplicate/recycled picture IDs, Music category/difficulty filtering, saved-state compatibility, reveal/award/undo, failed-image replacement, and desktop/TV layout.
Never use live shared standings for test games.

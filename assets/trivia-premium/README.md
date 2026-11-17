# Trivia Tavern premium artwork — v5.0

Original AI-generated artwork created for Chris’s Game Room in November 2026.
Optimized WebP assets: pub-v1.webp (1672×941), board-v1.webp (1200×800),
trophy-v1.webp (1200×675). Total image payload: 212,674 bytes.
Full-resolution original PNGs remain in the creation workspace.
The setup and ready screens also reuse the existing game-room-premium/trivia-v1.webp.

All questions, answers, choice labels, scores and player names remain live HTML.
The original trivia engine, question banks, saved-name keys and cloud-sync scripts
are unchanged. trivia-premium.js only observes rendered section visibility and
question length to apply presentation classes; it never reads or writes game data.

The question board, answer ticket, award row, ready screen and championship scene
use the same pub materials. Standings and backup controls share an expandable drawer.
Overflow remains available for unusually large imported questions or record lists.

Validation:
- node tests/trivia.test.cjs: 25/50 question decks, holiday deck, name validation,
  reveal, points, ready confirmation, undo, Nobody, finish, commit-once and skin states.
- node tests/last-call.test.cjs: shared question bank and existing roulette regression.
- All inline scripts compare byte-for-byte with the prior version; no duplicate IDs.
- Browser: actual reveal/award/next/undo/reset flow; eight-player setup and scoring,
  long multiple-choice question and answer, ready and finished at 960×540,
  1280×720 and 1920×1080. Tested TV pages, columns and boards have no overflow.
- Phone setup, choices, long answer, ready and results fit a 390px viewport with
  ordinary vertical scrolling and no horizontal overflow.
- Preview fixtures are isolated from shared standings and are never shipped.

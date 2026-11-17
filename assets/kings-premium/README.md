# King's Ison premium artwork — v2.0

Original AI-generated artwork created for Chris’s Game Room, November 2026.
The photographic camp, engraved card back, brass cup, and three court portraits are
optimized WebP assets. The cup retains alpha transparency. Original full-resolution
PNGs are retained in the creation workspace.

- camp-v1.webp: cinematic woodland table, lantern and campfire (1672 × 941).
- back-v1.webp: forest-green and gold engraved campfire deck (600 × 840).
- cup-v1.webp: engraved brass King's Cup (400 × 600, alpha).
- king-v1.webp, queen-v1.webp, jack-v1.webp: decorative court portraits (400 × 600).

All ranks, suits, ten-card pips, action text, and accessible card names are live HTML.
Generated illustrations never determine a game outcome or provide numeric labels.
The original 20-card rules, saved-name keys, personal doubles, and fourth-King ending
are unchanged. Only the dealt-card rendering was replaced in the game script.

Validation: node tests/kings.test.cjs covers 20 accurate card faces, the unique deck,
turn progression, personal doubles, directional actions, fourth King and restart.
Rendered browser checks cover setup (4 and 10 players), ready, all five ranks,
doubles and finale at 960×540, plus setup/king/doubles/finale at 1280×720 and
1920×1080. Setup and gameplay are also checked at 390px phone width with normal
vertical scrolling. Desktop page and panel overflow checks pass. Preview fixtures
remain outside the repository and are not deployed.

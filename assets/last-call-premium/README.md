# Last Call Roulette V3.0 artwork

Original artwork for Chris’s premium Game Room, November 16, 2026. All images
are local WebP assets (638 KB total); there is no external image host at runtime.

| Asset | Production size | Art brief |
| --- | --- | --- |
| `wheel-v1.webp` | 1000 × 1000 | Exact overhead walnut wheel with brass rings, blank dark felt face, central brass cap; no labels or numbers. |
| `bar-v1.webp` | 1599 × 900 | Warm classic neighborhood bar, walnut counter, brass taps, amber lamps, burgundy leather; quiet center for the playable wheel. |
| `villa-v1.webp` | 1599 × 900 | Tropical villa pool at dusk, bougainvillea, lanterns, palms and lounge furniture; dark space for confessional prompts. |
| `stage-v1.webp` | 1599 × 900 | Empty intimate rock stage, plum velvet, vintage microphone, guitar, tube amp and restrained amber/teal lights. |

The wheel rim and hub use photographic artwork. The twelve sectors, labels,
pointer alignment and rotation remain live, deterministic SVG/HTML. Shared
lobby images supply the trivia, finale and challenge-choice scenes. Every
question, countdown and action remains real text.

The update changes presentation only: the draw function and sector colors,
stylesheet, labels, version badge, and placement of Give Answer beside Next Spin.
Question decks, names/storage, outcome selection, suspense animation, sound,
timers, turn sequencing and game rules retain their existing code.

Validation: `node tests/last-call.test.cjs`; cloud-browser visual checks at
960×540, 1280×720, 1920×1080 and a 390px phone frame; all twelve scenes,
early escape and longest built-in trivia fixture; actual spins, reveal/next-turn
controls and sound toggle. Preview scene fixtures are outside the repository
and are never published. Physical Fire TV validation remains on-device.

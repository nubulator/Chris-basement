# Game Room lounge artwork

Original AI-generated artwork created for Chris’s approved premium Game Room design,
November 16, 2026. The nine WebP files are local production assets, with no external
image host, runtime generation, or additional image subscription.

- Eight game illustrations: 959 × 540, quality 85 WebP.
- Walnut and leather background: 1672 × 941, quality 85 WebP.
- Total image payload: 778,434 bytes.

The lobby uses real HTML for every title, description, navigation control, and game
link. Images are decorative; their playing cards are artwork, not game state.
`game-room-lounge.css` owns the lobby layout; `game-room-premium.css` supplies
finishes to existing games after `game-room-layout.css`.

The existing Eastern-time seasonal light calendar is retained in
`game-room-lounge.js`. Game scripts, records, Firebase configuration, question
banks, Bernie’s destination, and the November 7 baseline branches are unchanged.

Browser validation: lobby at 960 × 540, 1280 × 720, 1920 × 1080 and a 390px phone
frame; eight images loaded, no clipped card text, and no horizontal overflow.
All seven game pages checked at 960 × 540; lobby/game return navigation and the
Music Challenge help dialog checked. Existing eight-player Trivia and Music
states remain usable. Physical Fire TV behavior still benefits from on-device review.

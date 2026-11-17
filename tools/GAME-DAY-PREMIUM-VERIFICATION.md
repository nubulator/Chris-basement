# Game Day V2.0 verification — November 17, 2026

Both dashboards use the same Game Day core, Insider, trivia data, presentation JavaScript, CSS, and local image assets. Their HTML differs only in venue branding and the return button. Keep shared files identical when making future changes.

- 25 sourced historic questions for each of Browns, Ohio State, and Bengals. Saved shuffle bags prevent repeats within a cycle and immediate repeats at cycle boundaries; progress survives refreshes per browser.
- Node tests: 10 passed, including 10 complete shuffle cycles per team, reload-state round trips, malformed storage recovery, IDs, and team configuration.
- DOM integration checks: pregame, live and final states for all 3 teams; team switching, Reveal/Next, field position and offline fallback passed. Live checks used explicitly simulated states derived from recorded ESPN events, not a claim that a game was in progress.
- Cloud Chrome UI: live ESPN Browns/Bengals final scores and player/team statistics; Ohio State next matchup, TV, forecast, odds, injury fallback, Insider controls and photographed snack recipe.
- Layouts checked in browser frames at 1280×720 and 1920×1080, plus 390×844 portrait. No panel overflow in the final checked views. TV recipe ingredients and steps remain visible; phone layout scrolls vertically.
- Real locally hosted stadium photographs and team marks; visible photo-credit page. CSS remains for layout and styling. The live field is a precise SVG data diagram with position markers.

Source information that ESPN does not provide is labeled unavailable. Baseline branches, dashboard layouts, game pages and saved game data are outside this change.

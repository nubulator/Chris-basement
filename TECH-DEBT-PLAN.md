# Chris's Basement — technical debt cleanup plan

Baseline: **V83** (`index-v3822.html`). Keep this live file unchanged until a candidate passes visual and Fire TV Cube testing.

## Repository audit (2026-11-06)
- Main dashboard: approximately 342 KB of HTML.
- 75 inline `<style>` blocks, 23 `<script>` blocks, approximately 1,871 `!important` declarations.
- 12 `setInterval` calls (audit ownership and cleanup before consolidating).
- 35 HTML files, including historical versions and three ticker diagnostic pages.
- Current production URL: `index-v3822.html`. The filename is historical; the visible build label is V83.
- V79 `requestAnimationFrame`-scheduled Sports Center and Fun Zone rotations improved ticker smoothness on Fire TV Cube. Preserve this behavior.
- CSS for cone, header controls, perimeter, Fun Zone and ticker is layered across multiple version-specific patches. Cascade order is significant.

## Safe staged approach
1. **Inventory and backup.** Record active selectors, scripts, timers, external resources, dependencies and navigation references. Keep V83 as the rollback target. Do not delete historical pages or diagnostic files yet.
2. **Create a separate candidate** (`refactor-preview.html`) from V83. Do not change `index-v3822.html`, `index.html`, or `dashboards.json` during experiments.
3. **CSS consolidation in small groups.** Begin with header, theme controls, cone/version label, outer border, weather watermark, and Fun Zone wood frame. Remove obsolete declarations only after comparing computed behavior on the TV. Preserve dynamic seasonal styles.
4. **JavaScript organization.** Document each timer and listener, remove genuinely redundant operations, keep automatic rotation scheduling, and avoid repeated DOM replacement and forced synchronous layout.
5. **Verification.** Check all seasons and holiday modes, 6-day forecast, radar expand/close, Daily Line, sports filters, sponsor graphics, Fun Zone navigation and midnight rollover, AP ticker smoothness, Fire TV focus/highlight behavior, and responsive layout on LG TV/Fire TV Cube and phone.
6. **Promote only after approval.** Apply validated changes to production in a versioned commit; preserve the previous GitHub commit for rollback.

## Guardrails
- No wholesale rewrite.
- No renaming the production entry point without updating all references.
- No changes to Jim & Amy's Garage.
- No unverified removal of scripts, style blocks, older pages, or test pages.
- Prefer measurable changes, one subsystem per iteration.
- A GitHub Pages deployment succeeding does **not** prove Silk rendering is correct; test on the actual Fire TV Cube.

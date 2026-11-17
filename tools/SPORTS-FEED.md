# Dashboard sports feeds

`index-v3822.html` and Jim-Amys-Garage's `index.html` load the identical
`sports-feed.js` adapter. ESPN sports requests go through the existing public
backend at `https://bernie-bernie-family-card-night.nubulator.chatgpt.site/api/sports`.
Weather, news and game storage requests keep their existing paths.

The relay lives in Sites project `appgprj_6af4137041788191936e5717f8b30f21`,
in `lib/sports-feed.mjs` and the existing worker entrypoint. It is read-only,
accepts only the six configured ESPN leagues and allowed endpoint/query values,
and does not read or write game rooms, players or saved results. Retain the
existing D1 binding and game routes when maintaining it.

Scoreboards and summaries are cached for at most 30 seconds; schedules and team
records for five minutes; rankings for one hour. `X-Sports-Fetched-At` identifies
the upstream fetch time. Invalid/upstream failures return 503 without caching.
The home dashboard continues its existing 15-second scoreboard polling.
The separate Daily Line JSON is rebuilt every 30 minutes; it is an odds snapshot,
not the live-score source. Missing odds must remain unavailable. NHL/MLB
moneylines must not be displayed as point spreads.

Run `node --test tests/*.test.cjs` and `python3 tools/test_daily_line_feed.py`.
The Sports Center workflow runs paired Playwright verification against real
relay responses. Candidate mode substitutes only the two dashboard HTML files
and adapters at their production URLs. `--live` substitutes nothing and verifies
published HTML/adapters against checked-out source. It checks scores, status,
records, league filters, weather, Fun Zone Next and advancing upstream timestamps.
The Daily Line workflow separately builds the real feed, checks exact spread and
total values, deploys its exact tracked source, and tests the published cache.

Preserve the immutable `baseline-2026-11-07` refs in all three dashboard repos.
Do not change dashboard CSS/layouts or game data as part of feed maintenance.

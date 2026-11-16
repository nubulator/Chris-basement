# Daily history calendar: sources and reuse

## Dataset

`history-calendar.json` contains one event for each of the 366 possible month/day dates, including February 29. It is a bundled calendar; the dashboard does not need a live history API request to display an event.

The calendar was prepared on November 16, 2026 from the dated event records provided by [Muffin Labs Today in History](https://history.muffinlabs.com/). Its [open-source parser](https://github.com/muffinista/really-simple-history-api) extracts Wikipedia's month-and-day articles. Input URLs have the form `https://history.muffinlabs.com/date/M/D` (for example, `/date/11/16`). Only records in the Events category were considered.

Every input response's `date` was checked against the requested month and day before selection. Each output record retains `sourceDate` as an explicit `MM-DD` key and `source` / `dateSource` as a link to the corresponding Wikipedia date article. The display code must match `sourceDate` to today's Eastern calendar date. It must never use an unrelated event as a missing-date fallback.

## Attribution and license

Historical event descriptions are adapted from Wikipedia contributors, via Muffin Labs. The corresponding source page is linked in each record. Wikipedia text is available under the [Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/). The adapted descriptions and this calendar dataset are distributed under the same license. See Wikimedia's [content reuse guidance](https://www.mediawiki.org/wiki/Wikimedia_APIs/Content_reuse) and [developer attribution guidance](https://foundation.wikimedia.org/wiki/Legal:Wikimedia_Developer_App_Guidelines/en).

Changes include editorial selection, short rewritten descriptions, removal of markup and source artifacts, omission of unnecessary superlatives and changing-record claims, and corrections or clarification of selected descriptions against additional sources. This license statement applies to the history dataset; it does not relicense the dashboard's unrelated code or other content. No endorsement by Wikipedia, Muffin Labs, or the listed institutions is implied.

## Additional checks

These events received targeted checks against institutional or other direct sources. Their records include `verifiedSource` so the extra evidence travels with the data.

| Date | Event | Additional source |
| --- | --- | --- |
| January 1, 1863 | Emancipation Proclamation took effect | [National Archives](https://www.archives.gov/milestone-documents/emancipation-proclamation) |
| February 29, 1940 | Hattie McDaniel won an Academy Award | [Academy of Motion Picture Arts and Sciences](https://www.oscars.org/oscars/ceremonies/1940) |
| April 24, 1990 | Discovery launched with Hubble aboard | [NASA STS-31 mission](https://www.nasa.gov/mission/sts-31/) |
| May 26, 1967 | British release of Sgt. Pepper's Lonely Hearts Club Band | [Official Charts](https://www.officialcharts.com/albums/the-beatles-sgt-peppers-lonely-hearts-club-band/) |
| July 20, 1969 | Apollo 11 landed on the Moon | [NASA mission record](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11info.html) |
| September 29, 1954 | CERN formally came into being | [CERN convention history](https://home.cern/cern-and-unesco-celebrate-the-anniversary-of-the-signature-of-the-cern-convention/) |
| November 16, 1907 | Oklahoma became the 46th state | [National Archives](https://www.archives.gov/legislative/features/oklahoma) |
| November 17, 1968 | NBC interrupted the Jets-Raiders game with Heidi | [Las Vegas Raiders historical account](https://www.raiders.com/history/remembering-heidi-game) |

The complete calendar received structural validation and editorial review. These checks establish complete date coverage, source alignment, usable text, and the absence of arbitrary off-date fallback content. They are not an independent primary-source verification of every historical event. Retain the source links when updating a record, and recheck the exact date and year if its wording or event is changed.

## Maintenance rules

- Require exactly the 366 valid Gregorian `MM-DD` keys; use a leap year to validate the set.
- Require a nonempty event array, integer year, concise text, HTTP(S) source link, and `sourceDate` equal to the enclosing key.
- Keep display text at or below 150 characters and strip source markup rather than truncating it on screen.
- Keep event dates as the source's civil dates. The dashboard's Eastern time zone decides which calendar day to look up; it does not shift an event's anniversary to a different date.
- Preserve `verifiedSource` when present and keep this attribution with generated bundles.


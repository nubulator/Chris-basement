# Classic rock lyric catalog — source and editing notes

Updated November 16, 2026.

`classic-rock-lyrics.json` contains 400 song challenges across 55 artist labels. Each record contains one short lyric excerpt, the song title, and the performing artist. Twenty-four records also include a URL used to check the selected wording or the song association during this update.

## Coverage and validation

The catalog was curated from well-known classic rock recordings and reviewed for song-to-artist and phrase-to-song consistency. An independent review checked the initial 373-record draft for obvious mapping errors; the final 400-record catalog then passed automated checks for unique normalized song titles, unique normalized excerpts, nonempty artist names, and a maximum of 10 whitespace-separated words per excerpt. There are no duplicate cover versions under different artists. Van Halen's distinct song titled *Dreams* was excluded to keep even title-level uniqueness unambiguous alongside Fleetwood Mac's song of that name.

This is **not a claim that all 400 excerpts received independent source verification**. Source-linked records were spot-checked against retrieved artist, publisher, or licensed music-service pages. The remaining familiar excerpts were editorially reviewed. Future corrections should use the recording or an official artist/publisher lyric source, then add the checked source URL to the record.

## Sources checked

- [The Black Crowes' official lyric archive](https://theblackcrowes.com/discography/lyrics/) supports the eight Black Crowes selections, including the corrected *Hard to Handle* clue. The former dashboard clue associated with that song did not identify its actual lyric correctly.
- [U2's official page for *With or Without You*](https://www.u2.com/pages/song/with-or-without-you).
- Rush's official [*Freewill*](https://www.rush.com/songs/freewill/) and [*Tom Sawyer*](https://www.rush.com/songs/tom-sawyer/) lyric pages.
- [The Beatles' official *Across the Universe* page](https://www.thebeatles.com/across-universe).
- [Aerosmith's official *Get a Grip* lyrics](https://www.aerosmith.com/description?albumId=19), used to replace a very generic *Crazy* clue with a more distinctive excerpt.
- [Bruce Springsteen's official *Badlands* page](https://brucespringsteen.net/track/badlands/).
- [John Mellencamp's official-site article discussing *Paper in Fire*](https://www.mellencamp.com/oldnews/salon-com-----i---m-a-blue-guy-in-a-red-state-----john-mellencamp-and-the-search-for-an-american-soul).
- Musicnotes, Apple Music, Amazon Music, and Shazam pages linked on individual records were used for additional wording checks, including *All My Love*, *Against the Wind*, *Why Can't This Be Love*, *Green River*, *Destroyer*, *Conquistador*, *Legs*, *Dust in the Wind*, and *Black Dog*.

## Corrections and editorial standards

- Use an actual sung phrase. Titles such as *Black Dog*, *Kashmir*, and *Baba O'Riley* must not stand in for nonexistent title lyrics.
- Keep exactly one excerpt per song, at most 10 words. Do not add complete verses, choruses, or surrounding lyric text to source notes.
- Prefer distinctive phrases that allow a fair guess; avoid filler such as a generic greeting or a few words used by many songs.
- Prefer clues that do not state the title, while retaining an accessible mix of easier and harder selections.
- Treat spelling, contractions, punctuation, and recording variants carefully. The *Green River* excerpt follows the linked Apple Music wording; some transcriptions differ in the final verb ending.
- Keep song titles and performing-artist labels consistent. A cover should replace an existing song entry only deliberately; it must not create an additional daily slot for the same song.
- The calendar rotation is implemented separately. Catalog uniqueness alone does not prove the daily selection algorithm avoids repeats; the rotation tests must also pass.

Lyrics remain the work of their respective songwriters and rights holders. Source links document checks; they do not imply that the entire catalog is openly licensed.

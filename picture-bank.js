/* Picture clues: source credits are revealed after the answer. Keep IDs stable for saved rounds. */
window.GameRoomPictures = {
 trivia: [
 {id:'pic-t-film-1',cat:'Picture · Classic movies',q:'Name the classic movie in this picture.',a:"It's a Wonderful Life (1946)",image:'https://upload.wikimedia.org/wikipedia/commons/2/27/Wonderfullife_trailer_1.jpg',source:'https://commons.wikimedia.org/wiki/File:Wonderfullife_trailer_1.jpg',credit:'Trailer still · Public domain in the US'},
 {id:'pic-t-film-2',cat:'Picture · Classic movies',q:'Name this Charlie Chaplin movie.',a:'The Gold Rush (1925)',image:'https://upload.wikimedia.org/wikipedia/commons/c/ce/The_gold_rush_01.jpg',source:'https://commons.wikimedia.org/wiki/File:The_gold_rush_01.jpg',credit:'Charles Chaplin · Public domain in the US'},
 {id:'pic-t-film-3',cat:'Picture · Classic movies',q:'Name this silent vampire movie.',a:'Nosferatu (1922)',image:'https://upload.wikimedia.org/wikipedia/commons/2/23/Nosferatu.jpg',source:'https://commons.wikimedia.org/wiki/File:Nosferatu.jpg',credit:'Film still · Public domain'},
 {id:'pic-t-film-4',cat:'Picture · Classic movies',q:'Name this classic zombie movie.',a:'Night of the Living Dead (1968)',image:'https://upload.wikimedia.org/wikipedia/commons/5/56/Zombies_NightoftheLivingDead.jpg',source:'https://commons.wikimedia.org/wiki/File:Zombies_NightoftheLivingDead.jpg',credit:'George A. Romero · Film still · Public domain in the US'},
 {id:'pic-t-place-1',cat:'Picture · Landmarks',q:'Name this famous bridge.',a:'Golden Gate Bridge — San Francisco, California',image:'https://upload.wikimedia.org/wikipedia/commons/3/3e/GoldenGateBridge.jpg',source:'https://commons.wikimedia.org/wiki/File:GoldenGateBridge.jpg',credit:'Peter Craig · Public domain'},
 {id:'pic-t-place-2',cat:'Picture · Landmarks',q:'Name this prehistoric landmark.',a:'Stonehenge — Wiltshire, England',image:'https://upload.wikimedia.org/wikipedia/commons/3/3d/Stonehenge.arp.jpg',source:'https://commons.wikimedia.org/wiki/File:Stonehenge.arp.jpg',credit:'Adrian Pingstone · Public domain'},
 {id:'pic-t-place-3',cat:'Picture · Landmarks',q:'Name the landmark in this historic photograph.',a:'Taj Mahal — Agra, India',image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Taj_Mahal_%28front_view%29.jpg/960px-Taj_Mahal_%28front_view%29.jpg',source:'https://commons.wikimedia.org/wiki/File:Taj_Mahal_(front_view).jpg',credit:'Felice Beato / Getty Museum Collection · CC0'},
 {id:'pic-t-place-4',cat:'Picture · Landmarks',q:'Name this famous tower.',a:'Eiffel Tower — Paris, France',image:'https://upload.wikimedia.org/wikipedia/commons/8/84/EiffelTower.jpg',source:'https://commons.wikimedia.org/wiki/File:EiffelTower.jpg',credit:'Photo: Zoryana · CC BY-SA 3.0 · Unmodified',license:'https://creativecommons.org/licenses/by-sa/3.0/'}
 ],
 music: [
 {id:'pic-m-artist-1',genre:'Picture · Artist',level:'Medium',tags:['classic','pop'],q:'Who is this artist?',a:'David Bowie',image:'https://upload.wikimedia.org/wikipedia/commons/6/68/David_Bowie_1974.JPG',source:'https://commons.wikimedia.org/wiki/File:David_Bowie_1974.JPG',credit:'ABC Television · Public domain in the US'},
 {id:'pic-m-artist-2',genre:'Picture · Artist',level:'Medium',tags:['classic','pop','80s'],q:'Who is this artist?',a:'Stevie Nicks',image:'https://upload.wikimedia.org/wikipedia/commons/c/c0/Stevie_Nicks_1977_%28cropped%29.jpg',source:'https://commons.wikimedia.org/wiki/File:Stevie_Nicks_1977_(cropped).jpg',credit:'Warner Bros. Records · Public domain in the US'},
 {id:'pic-m-artist-3',genre:'Picture · Artist',level:'Easy',tags:['classic','pop'],q:'Who is this artist?',a:'Elvis Presley',image:'https://upload.wikimedia.org/wikipedia/commons/7/7f/Elvis_Presley_1970_cropped.jpg',source:'https://commons.wikimedia.org/wiki/File:Elvis_Presley_1970_cropped.jpg',credit:'Ollie Atkins / White House · Public domain'},
 {id:'pic-m-artist-4',genre:'Picture · Artist',level:'Easy',tags:['pop','80s'],q:'Who is this artist?',a:'Dolly Parton',image:'https://upload.wikimedia.org/wikipedia/commons/2/26/Young-Dolly-Parton_%28cropped%29.jpg',source:'https://commons.wikimedia.org/wiki/File:Young-Dolly-Parton_(cropped).jpg',credit:'RCA Records · Public domain in the US'},
 {id:'pic-m-album-1',genre:'Picture · Album cover',level:'Easy',tags:['classic'],q:'Name this album.',a:'The Dark Side of the Moon — Pink Floyd (1973)',image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Dark_Side_of_the_Moon.png/500px-Dark_Side_of_the_Moon.png',source:'https://en.wikipedia.org/wiki/File:Dark_Side_of_the_Moon.png',credit:'Cover art: Hipgnosis / George Hardie · Shown for album identification; artwork rights remain with their owners'},
 {id:'pic-m-album-2',genre:'Picture · Album cover',level:'Medium',tags:['classic'],q:'Name this album.',a:'Abbey Road — The Beatles (1969)',image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/The_Beatles_Abbey_Road_album_cover.jpg/500px-The_Beatles_Abbey_Road_album_cover.jpg',source:'https://en.wikipedia.org/wiki/File:Beatles_-_Abbey_Road.jpg',credit:'Cover photo: Iain Macmillan · Shown for album identification; artwork rights remain with their owners'}
 ]
};

window.GameRoomPictures.music.push(...[
  {
    "id": "pic-m-artist-5",
    "a": "Freddie Mercury",
    "level": "Medium",
    "tags": [
      "classic",
      "80s"
    ],
    "genre": "Picture · Artist",
    "q": "Who is this artist?",
    "image": "https://upload.wikimedia.org/wikipedia/commons/9/96/Freddie_Mercury_%281977_Press_Kit_Photo%29.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Freddie_Mercury_(1977_Press_Kit_Photo).jpg",
    "credit": "Christopher Hopper / Elektra Records · Public domain in the US"
  },
  {
    "id": "pic-m-artist-6",
    "a": "Michael Jackson",
    "level": "Easy",
    "tags": [
      "pop",
      "80s",
      "90s"
    ],
    "genre": "Picture · Artist",
    "q": "Who is this artist?",
    "image": "https://upload.wikimedia.org/wikipedia/commons/2/27/Michael_Jackson_1984_%28Cropped%29.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Michael_Jackson_1984_(Cropped).jpg",
    "credit": "White House Photo Office · Public domain in the US"
  },
  {
    "id": "pic-m-artist-7",
    "a": "Tina Turner",
    "level": "Medium",
    "tags": [
      "pop",
      "classic",
      "80s"
    ],
    "genre": "Picture · Artist",
    "q": "Who is this artist?",
    "image": "https://upload.wikimedia.org/wikipedia/commons/7/74/Tina_Turner_1970.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Tina_Turner_1970.jpg",
    "credit": "Al Kaplan / Jay Bernstein Public Relations · Public domain in the US"
  },
  {
    "id": "pic-m-artist-8",
    "a": "Elton John",
    "level": "Easy",
    "tags": [
      "pop",
      "classic",
      "80s",
      "90s"
    ],
    "genre": "Picture · Artist",
    "q": "Who is this artist?",
    "image": "https://upload.wikimedia.org/wikipedia/commons/9/97/Elton_john_rock_music_awards_1975.JPG",
    "source": "https://commons.wikimedia.org/wiki/File:Elton_john_rock_music_awards_1975.JPG",
    "credit": "CBS Television · Public domain in the US"
  }
]);

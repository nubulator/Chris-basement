/* Shared, offline-ready snack content for both Game Day layouts. */
(function (root) {
  'use strict';
  const recipes = {
    dogs: { name: 'Chicago-style game dogs', photo: 'chicago-dogs', time: '20 MIN', serves: 'SERVES 4', ingredients: '4 beef hot dogs + buns • mustard • relish • tomato • onion • pickle spears • sport peppers • celery salt', method: 'Heat dogs as directed on the package. Fill warm buns, pile on the toppings and finish with celery salt.', why: 'A Chicago-style spread for this Illinois matchup.' },
    wings: { name: 'Buffalo wings', photo: 'wings', time: '25 MIN', serves: 'SERVES 4–6', ingredients: '2 lb fully cooked wings • ⅓ cup hot sauce • 3 tbsp melted butter • celery • blue cheese dip', method: 'Reheat wings following the package directions. Toss with hot sauce and butter; serve with celery and dip.', why: 'Buffalo-inspired heat for the Bills matchup.' },
    nachos: { name: 'Tex-Mex game nachos', photo: 'nachos', time: '20 MIN', serves: 'SERVES 4–6', ingredients: '8 oz tortilla chips • 2 cups shredded cheese • 1 cup drained black beans • salsa • jalapeños', method: 'Layer chips, beans and cheese on a tray. Bake at 375°F for 8–10 minutes until melted. Finish with salsa and jalapeños.', why: 'A Tex-Mex share plate for this Texas matchup.' },
    pretzels: { name: 'Warm pretzels & cheddar dip', photo: 'pretzels', time: '15 MIN', serves: 'SERVES 4–6', ingredients: '6 frozen soft pretzels • 1 cup prepared cheddar dip • coarse salt • mustard', method: 'Bake pretzels as directed on the package. Warm the cheese dip, cut pretzels into sharing pieces and serve with mustard.', why: 'A warm, salty tailgate classic.' },
    pizza: { name: 'Detroit-style pizza squares', photo: 'pizza', time: '30 MIN', serves: 'SERVES 4–6', ingredients: '1 Detroit-style frozen pizza • pepperoni, if desired • grated Parmesan • red pepper flakes', method: 'Bake the pizza following its package directions. Rest for 5 minutes, cut into small squares and set out the toppings.', why: 'Crisp-edged Detroit-style squares for this Michigan matchup.' },
    crab: { name: 'Maryland crab dip', photo: 'crab-dip', time: '30 MIN', serves: 'SERVES 6', ingredients: '8 oz cooked crab • 8 oz cream cheese • ½ cup sour cream • ½ cup cheddar • 1 tsp Old Bay • crackers', method: 'Mix softened cream cheese, sour cream and seasoning; fold in crab. Top with cheddar and bake at 375°F for about 20 minutes, until bubbling.', why: 'Crab and Old Bay bring a Maryland-inspired taste to the table.' },
    cuban: { name: 'Cuban sandwich bites', photo: 'cuban', time: '20 MIN', serves: 'SERVES 4–6', ingredients: '1 Cuban bread loaf • 8 oz cooked roast pork • 4 oz ham • 4 slices Swiss • pickles • mustard', method: 'Layer the fillings in the bread. Press in a hot skillet until crisp and heated through, then cut into small sharing pieces.', why: 'A Florida-inspired platter of pressed sandwich bites.' },
    tots: { name: 'Loaded tailgate tots', photo: 'tots', time: '30 MIN', serves: 'SERVES 4–6', ingredients: '1 lb frozen tots • 1 cup shredded cheddar • ¼ cup cooked bacon bits • sour cream • green onions', method: 'Bake tots following the package directions. Add cheddar for the last 2 minutes, then top with bacon, sour cream and green onions.', why: 'A hearty, shareable snack for a Midwest matchup.' },
    chowder: { name: 'Chowder dunking cups', photo: 'chowder', time: '15 MIN', serves: 'SERVES 6', ingredients: '4 cups prepared clam chowder • 1 sourdough loaf • oyster crackers • black pepper', method: 'Heat chowder following its package directions. Ladle into small cups and serve with sourdough strips and crackers.', why: 'Coastal comfort food, portioned for game-time dipping.' }
  };
  // Full names and abbreviations are matched within the selected league, longest first.
  const nfl = [
    ['Chicago Bears|CHI', 'dogs'], ['Buffalo Bills|BUF', 'wings'],
    ['Detroit Lions|DET', 'pizza'], ['Baltimore Ravens|BAL', 'crab'],
    ['Miami Dolphins|MIA|Tampa Bay Buccaneers|TB', 'cuban'],
    ['Houston Texans|HOU|Dallas Cowboys|DAL', 'nachos'],
    ['Minnesota Vikings|MIN|Indianapolis Colts|IND', 'tots'],
    ['Green Bay Packers|GB', 'pretzels', 'Wisconsin cheddar & pretzels', 'A cheddar-forward snack for the Green Bay matchup.'],
    ['Philadelphia Eagles|PHI|New York Giants|NYG|New York Jets|NYJ', 'pretzels', 'Street-cart pretzels & dip', 'An East Coast street-cart snack, ready for sharing.'],
    ['New England Patriots|NE', 'chowder', 'New England chowder cups', 'Creamy clam chowder for a New England-inspired snack.'],
    ['Seattle Seahawks|SEA|San Francisco 49ers|SF', 'chowder', 'Coastal chowder & sourdough', 'A coastal-inspired pairing of chowder and sourdough.'],
    ['Pittsburgh Steelers|PIT', 'tots', 'Steel City loaded tots', 'A Pittsburgh-inspired pile of potatoes, cheese and bacon.'],
    ['Cincinnati Bengals|CIN', 'nachos', 'Cincinnati chili nachos', 'A Cincinnati chili twist for the Ohio rivalry.', 'Add 1 cup hot, prepared Cincinnati-style chili before serving.'],
    ['Kansas City Chiefs|KC|Carolina Panthers|CAR|Atlanta Falcons|ATL|Tennessee Titans|TEN', 'wings', 'Barbecue game wings', 'A Southern barbecue-inspired tray for this matchup.', 'Swap the hot sauce and butter for ½ cup barbecue sauce.'],
    ['New Orleans Saints|NO', 'wings', 'Cajun-spiced game wings', 'A Louisiana-inspired kick for the Saints matchup.', 'Add 1 tsp Cajun seasoning to the sauce.'],
    ['Arizona Cardinals|ARI|Las Vegas Raiders|LV|Los Angeles Rams|LAR|Los Angeles Chargers|LAC|Denver Broncos|DEN', 'nachos', 'Southwest loaded nachos', 'A Southwest-inspired tray with cheese, salsa and jalapeños.'],
    ['Jacksonville Jaguars|JAX', 'cuban'], ['Washington Commanders|WSH|WAS', 'dogs', 'Capital game dogs', 'A ballpark-style spread for the Washington matchup.'],
    ['Cleveland Browns|CLE', 'pretzels']
  ];
  const college = [
    ['Northwestern Wildcats|Northwestern|NW|NU', 'dogs', 'Chicago-style game dogs', 'Northwestern’s Evanston home inspires this Chicago-area classic.'],
    ['Illinois Fighting Illini|Illinois|ILL', 'dogs'],
    ['Michigan State Spartans|Michigan State|MSU|Michigan Wolverines|Michigan|MICH', 'pizza'],
    ['Wisconsin Badgers|Wisconsin|WIS', 'pretzels', 'Wisconsin cheddar & pretzels', 'A cheddar-forward snack for the Wisconsin matchup.'],
    ['Maryland Terrapins|Maryland|MD', 'crab'],
    ['Minnesota Golden Gophers|Minnesota|MINN', 'tots'],
    ['Purdue Boilermakers|Purdue|PUR|Indiana Hoosiers|Indiana|IND|Ball State Cardinals|Ball State|BALL', 'tots', 'Hoosier loaded tots', 'A hearty Midwest-inspired tray for this Indiana opponent.'],
    ['Iowa Hawkeyes|Iowa|IOWA|Nebraska Cornhuskers|Nebraska|NEB', 'nachos', 'Corn-country nachos', 'Sweet corn adds a Midwest twist for this matchup.', 'Add 1 cup cooked sweet corn with the beans.'],
    ['Penn State Nittany Lions|Penn State|PSU|Rutgers Scarlet Knights|Rutgers|RUTG', 'pretzels', 'East Coast pretzels & dip', 'Warm pretzels for a Pennsylvania or New Jersey-inspired tailgate.'],
    ['Oregon Ducks|Oregon|ORE|Washington Huskies|Washington|WASH', 'tots', 'Northwest loaded tots', 'A potato-filled sharing tray for this Pacific Northwest matchup.'],
    ['USC Trojans|USC|UCLA Bruins|UCLA', 'nachos', 'California game nachos', 'A California-inspired tray of chips, cheese and salsa.'],
    ['Texas Longhorns|Texas|TEX', 'nachos'],
    ['Ohio State Buckeyes|Ohio State|OSU|Kent State Golden Flashes|Kent State|KENT|Ohio Bobcats|Ohio|OHIO|Akron Zips|Akron|AKR', 'pretzels', 'Ohio tailgate pretzels', 'An easy, warm snack for this Ohio matchup.']
  ];
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  function select(team, isCollege) {
    const values = ['displayName', 'shortDisplayName', 'location', 'name', 'abbreviation'].map(k => normalize(team?.[k])).filter(Boolean);
    const entries = (isCollege ? college : nfl).flatMap(row => row[0].split('|').map(alias => ({ row, alias: normalize(alias) }))).sort((a, b) => b.alias.length - a.alias.length);
    const match = entries.find(({ alias }) => values.some(value => value === alias || (alias.length > 3 && (' ' + value + ' ').includes(' ' + alias + ' '))))?.row;
    const recipe = { ...recipes[match?.[1] || 'nachos'] };
    if (match) {
      recipe.name = match[2] || recipe.name;
      recipe.why = match[3] || recipe.why;
      if (match[4]) recipe.method += ' ' + match[4];
    } else {
      recipe.name = 'Loaded game-time nachos';
      recipe.why = 'House favorite • an easy sharing tray for any matchup.';
    }
    recipe.opponent = team?.displayName || team?.shortDisplayName || team?.location || '';
    recipe.matched = !!match;
    return recipe;
  }
  function render(host, recipe) {
    const photo = photos[recipe.photo];
    if (host.dataset.recipe === JSON.stringify(recipe)) return;
    host.dataset.recipe = JSON.stringify(recipe);
    host.replaceChildren();
    const figure = document.createElement('figure');
    figure.className = 'snack-photo';
    const img = document.createElement('img');
    img.src = photo.file;
    img.alt = photo.alt;
    img.decoding = 'async';
    // One local photo is bundled per food. Retry its original source if needed.
    img.onerror = () => { img.onerror = null; img.src = photo.imageSource; };
    const caption = document.createElement('figcaption');
    caption.append('Serving idea · ');
    const credit = document.createElement('a');
    credit.href = photo.source;
    credit.textContent = photo.author;
    credit.target = '_blank'; credit.rel = 'noopener';
    caption.append(credit, ' · ');
    const license = document.createElement('a');
    license.href = photo.licenseUrl;
    license.textContent = photo.license;
    license.target = '_blank'; license.rel = 'noopener';
    caption.append(license);
    figure.append(img, caption);
    const copy = document.createElement('div');
    copy.className = 'snack-copy';
    for (const [tag, cls, value] of [
      ['h3', 'snack-name', recipe.name], ['p', 'snack-why', recipe.why],
      ['p', 'snack-meta', recipe.time + ' APPROX.  ·  ' + recipe.serves],
      ['h4', 'snack-label', 'WHAT YOU NEED'], ['p', 'snack-ingredients', recipe.ingredients],
      ['h4', 'snack-label', 'QUICK PREP'], ['p', 'snack-method', recipe.method]
    ]) { const node = document.createElement(tag); node.className = cls; node.textContent = value; copy.append(node); }
    host.append(figure, copy);
  }
  // Photo metadata is populated from the checked-in Wikimedia assets below.
  const photos = {
  "chicago-dogs": {
    "id": "chicago-dogs",
    "file": "assets/snacks/chicago-dogs.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Chicago-style_hot_dog_2.jpg",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Chicago-style_hot_dog_2.jpg/960px-Chicago-style_hot_dog_2.jpg",
    "author": "Arnold Gatilao",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "Chicago-style hot dogs with mustard, pickles and tomato"
  },
  "wings": {
    "id": "wings",
    "file": "assets/snacks/wings.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Buffalo_wings-01.jpg",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Buffalo_wings-01.jpg/960px-Buffalo_wings-01.jpg",
    "author": "Clotee Pridgen Allochuku",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "Chicken wings with sauce, a serving idea"
  },
  "nachos": {
    "id": "nachos",
    "file": "assets/snacks/nachos.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Nachos-cheese.jpg",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Nachos-cheese.jpg/960px-Nachos-cheese.jpg",
    "author": "chee.hong",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "A platter of nachos with melted cheese and peppers"
  },
  "pretzels": {
    "id": "pretzels",
    "file": "assets/snacks/pretzels.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:BrezelnSalz02_%28cropped%29.JPG",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/BrezelnSalz02_%28cropped%29.JPG/960px-BrezelnSalz02_%28cropped%29.JPG",
    "author": "Sundar1",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "alt": "Salted soft pretzels"
  },
  "pizza": {
    "id": "pizza",
    "file": "assets/snacks/pizza.png",
    "source": "https://commons.wikimedia.org/wiki/File:Detroit_Style_Pizza_in_Lloyds_Detroit_Style_Pan.png",
    "imageSource": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Detroit_Style_Pizza_in_Lloyds_Detroit_Style_Pan.png",
    "author": "CarbertWiki",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "alt": "Detroit-style rectangular pizza"
  },
  "crab-dip": {
    "id": "crab-dip",
    "file": "assets/snacks/crab-dip.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:CrabDipAndFlatbread.jpg",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/CrabDipAndFlatbread.jpg/960px-CrabDipAndFlatbread.jpg",
    "author": "Imjustmatthew",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "alt": "Crab dip with flatbread"
  },
  "cuban": {
    "id": "cuban",
    "file": "assets/snacks/cuban.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Tampa_Cuban_sandwich.jpg",
    "imageSource": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tampa_Cuban_sandwich.jpg",
    "author": "Zeng8r",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "alt": "A pressed Cuban sandwich"
  },
  "tots": {
    "id": "tots",
    "file": "assets/snacks/tots.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Tater_Tots_Close_Up_%2824782852665%29.jpg",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Tater_Tots_Close_Up_%2824782852665%29.jpg/960px-Tater_Tots_Close_Up_%2824782852665%29.jpg",
    "author": "Willis Lam",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "alt": "Golden potato tots before adding toppings"
  },
  "chowder": {
    "id": "chowder",
    "file": "assets/snacks/chowder.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Quail_07_bg_041506.jpg",
    "imageSource": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Quail_07_bg_041506.jpg/960px-Quail_07_bg_041506.jpg",
    "author": "Jon Sullivan",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
    "alt": "Creamy clam chowder"
  }
};
  root.GameDaySnacks = { select, render, recipes, nfl, college, photos };
})(typeof window === 'undefined' ? globalThis : window);

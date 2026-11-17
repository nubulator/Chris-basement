/* Optional names only: the game still owns inputs, saved names and scores. */
(() => {
  'use strict';
  const players = Object.freeze([
    'Poopy Butt', 'Sir Farts-a-Lot', 'Captain Underpants', 'Booger McGee',
    'Princess Pickle', 'Professor Poot', 'Waffle Goblin', 'Stinky McStinkface',
    'Chicken Nugget', 'Banana Pants', 'Doodle Noodle', 'Toot McScoot',
    'Lord of the Fries', 'Giggle Pickle', 'Burpzilla', 'Cheese Goblin',
    'Soggy Waffles', 'Noodle Head', 'Butt Nugget', 'The Fart Knight'
  ]);
  const teams = Object.freeze([
    'Nacho Average Team', 'The Lawn Order', 'Sofa So Good', 'Grill Seekers',
    'The Pun Also Rises', 'The Grateful Dads', 'Dads of Thunder', 'The Grilluminati',
    'License to Grill', 'The Remote Controls', 'Sons of Puns', 'The Dad Bod Squad',
    'Ctrl Alt Defeat', 'The Lawn Rangers', 'We Thought This Was Bingo',
    'The Missing Socks', 'The Receding Hairlines', 'Dill With It',
    'The Spare Parts', 'We Came for the Snacks'
  ]);
  const list = kind => kind === 'team' ? teams : players;
  function append(container, kind, choose) {
    const section = document.createElement('section'); section.className = 'gr-suggested-names';
    const title = document.createElement('h3'); title.textContent = kind === 'team' ? 'Dad-joke team names' : 'Goofy names';
    const hint = document.createElement('p'); hint.textContent = 'Or pick a made-up name. Typing and saved names still work.';
    const grid = document.createElement('div'); grid.className = 'gr-name-grid';
    list(kind).forEach(name => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = name;
      button.onclick = () => choose(name); grid.appendChild(button);
    });
    section.append(title, hint, grid); container.appendChild(section);
  }
  function addOptions(select, kind) {
    const group = document.createElement('optgroup'); group.label = kind === 'team' ? 'Dad-joke team names' : 'Goofy names';
    list(kind).forEach(name => { const option = document.createElement('option'); option.value = name; option.textContent = name; group.appendChild(option); });
    select.appendChild(group);
  }
  if (typeof document !== 'undefined') {
    const css = document.createElement('style');
    css.textContent = '.gr-suggested-names{grid-column:1/-1;flex-basis:100%;width:100%;border-top:1px solid #bfa77766;margin-top:10px;padding-top:10px}.gr-suggested-names h3{font:800 17px/1.3 system-ui;margin:0 0 4px;color:inherit}.gr-suggested-names p{font:13px/1.4 system-ui;opacity:.8;margin:0 0 10px}.gr-name-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:8px}.gr-name-grid button{min-height:44px;white-space:normal;font-size:15px;line-height:1.25;padding:8px!important}.gr-name-grid button:focus-visible{outline:3px solid #ffe29b;outline-offset:2px}#savedNamePicker,#savedTeamPicker{max-height:80vh;overflow:auto;overscroll-behavior:contain}#namePicker .picker-card{max-height:85vh;overflow:auto;overscroll-behavior:contain}';
    document.head.appendChild(css);
  }
  window.GameRoomNames = { players, teams, append, addOptions };
})();


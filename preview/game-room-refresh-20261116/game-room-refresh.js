/* Shared rules and accessibility enhancements. Never writes scores or player data. */
(() => {
  'use strict';
  const page = document.body.dataset.game;
  const guides = {
    trivia: ['Trivia Tavern', 'Add 1–8 players, choose 25 or 50 questions, then pick a holiday theme if you like.', 'Read the question aloud. Reveal the answer, then award one point to the player who got it right—or choose Nobody.', 'Use Undo to correct an award. At the end, choose Commit Results to add the game to the all-time standings.'],
    music: ['Music Challenge', 'Add 1–8 players. Choose the length, difficulty, and any combination of decades or genres.', 'These are music trivia questions. Read the question and any answer choices, reveal the answer, and award the point.', 'Confirm when everyone is ready for the next question. Commit the final results to save the show to the Hall of Fame.'],
    survey: ['Survey Showdown', 'Name two teams and choose your number of rounds. The host controls the board.', 'Enter a guess to reveal a matching answer. Three strikes give the other team one steal attempt. These are original game-created rankings, not measured survey results.', 'Use Undo to fix a host mistake. Phone keypads let players type guesses while the TV keeps the board visible.'],
    casino: ['High Stakes Casino', 'Add 1–8 players and choose 3, 5, or 10 turns each. Every turn starts with 100 play chips.', 'Guess Higher or Lower. 2 is lowest; Ace is highest. A matching rank is a push. A correct guess doubles the pot; a wrong guess loses the unbanked chips.', 'Bank to keep the chips. Double or Nothing makes one more guess, then banks automatically if you win. Most banked chips wins. Play chips only.'],
    'last-call': ['Last Call Roulette', 'Add the crew, spin the wheel, and follow the challenge for the current player.', 'Timed challenges include a 3-second preparation period followed by 15 seconds. Trivia answers stay hidden until you choose Give Answer.', 'Game Over can end the night after everyone has had a turn. Anyone can pass; water and mocktails count.'],
    kings: ['King’s Ison', 'Choose 1–10 seats and enter names. One player works for practice; game night is 2–10 players.', 'Draw from the 20-card deck. Follow the card action, then move to the next player. Consecutive matching cards in your own hand double the action; Kings never multiply.', 'The fourth King ends the game. Open Card actions & house rules during play for the full rules. Drinking is optional.'],
    euchre: ['Euchre Night', 'Standings show nights won and total individual games for the selected season.', 'After playing, open Record Night. Enter the date and each team’s game wins. The team with more games earns one night win; tied nights award neither team a win.', 'Use Results to correct an entry. Champions records the season winner and travel choice. Backups contains the shared-score tools.']
  };
  const guide = guides[page];
  if (guide) {
    const nav = document.querySelector('main>.top,main>.nav') || document.querySelector('body>header');
    if (nav) {
      const trigger = document.createElement('button');
      trigger.type = 'button'; trigger.className = 'gr-guide-button'; trigger.textContent = 'How to play';
      trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-controls', 'grHelp');
      const overlay = document.createElement('div');
      overlay.id = 'grHelp'; overlay.className = 'gr-help'; overlay.hidden = true;
      overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'grHelpTitle');
      const card = document.createElement('div'); card.className = 'gr-help-card';
      const title = document.createElement('h2'); title.id = 'grHelpTitle'; title.textContent = guide[0];
      const steps = document.createElement('ol');
      guide.slice(1).forEach(step => { const li = document.createElement('li'); li.textContent = step; steps.append(li); });
      const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Got it — back to the game';
      card.append(title, steps, close); overlay.append(card); document.body.append(overlay); nav.append(trigger);
      let previous;
      const dismiss = () => { overlay.hidden = true; (previous || trigger).focus(); };
      trigger.addEventListener('click', () => { previous = document.activeElement; overlay.hidden = false; close.focus(); });
      close.addEventListener('click', dismiss);
      overlay.addEventListener('click', event => { if (event.target === overlay) dismiss(); });
      // Capture at window level so existing remote handlers cannot move focus behind the guide.
      window.addEventListener('keydown', event => {
        if (overlay.hidden) return;
        if (['Escape', 'BrowserBack', 'GoBack'].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); dismiss(); }
        else if (['Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); close.focus(); }
        else if (['ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); card.scrollBy(0, event.key === 'ArrowDown' ? 100 : -100); }
        else if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); event.stopImmediatePropagation(); dismiss(); }
      }, true);
    }
  }
  // Announce meaningful turn changes without repeatedly reading the entire board.
  ['setupNotice', 'gameNotice', 'hostNotice', 'result', 'action', 'turn', 'winner'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.hasAttribute('aria-live')) el.setAttribute('aria-live', 'polite');
  });
  if (page === 'euchre') {
    document.querySelectorAll('.euchre-tabs .tab').forEach(tab => {
      tab.setAttribute('aria-controls', tab.dataset.panel);
      const sync = () => tab.setAttribute('aria-pressed', String(tab.classList.contains('active')));
      sync(); new MutationObserver(sync).observe(tab, {attributes:true, attributeFilter:['class']});
    });
  }
  if (page === 'casino') {
    const cards = document.querySelector('.cards');
    if (cards) { const tip = document.createElement('p'); tip.className = 'gr-card-tip'; tip.textContent = '2 is low · Ace is high · Matching ranks are a push'; cards.after(tip); }
  }
})();

// Presentation only. The trivia engine remains the owner of scores and game state.
(() => {
  const body = document.body;
  const setup = document.getElementById('setup');
  const game = document.getElementById('game');
  const ready = document.getElementById('readyArea');
  const answer = document.getElementById('answer');
  const finished = document.getElementById('finished');
  const question = document.getElementById('question');
  if (!setup || !game || !ready || !answer || !finished) return;
  function update() {
    const playing = !game.classList.contains('hidden');
    body.classList.toggle('tavern-playing', playing);
    body.classList.toggle('tavern-ready', playing && !ready.classList.contains('hidden'));
    body.classList.toggle('tavern-answer', playing && !answer.classList.contains('hidden'));
    body.classList.toggle('tavern-finished', !finished.classList.contains('hidden'));
    body.classList.toggle('tavern-long', question?.dataset.size === 'long');
  }
  const observer = new MutationObserver(update);
  if (question) observer.observe(question, {attributes:true, attributeFilter:['data-size']});
  for (const section of [setup, game, ready, answer, finished]) {
    observer.observe(section, {attributes:true, attributeFilter:['class']});
  }
  update();
})();

// Presentation only; the existing engine owns questions, scores and stored records.
(() => {
  const game = document.getElementById('game');
  const ready = document.getElementById('nextGate');
  const answer = document.getElementById('answer');
  const question = document.getElementById('question');
  const finished = document.getElementById('finished');
  if (!game || !ready || !answer || !finished) return;
  function update() {
    const playing = !game.classList.contains('hidden');
    document.body.classList.toggle('music-playing', playing);
    document.body.classList.toggle('music-ready', playing && !ready.classList.contains('hidden'));
    document.body.classList.toggle('music-answer', playing && !answer.classList.contains('hidden'));
    document.body.classList.toggle('music-long', question?.dataset.length === 'long');
    document.body.classList.toggle('music-finished', !finished.classList.contains('hidden'));
  }
  const observer = new MutationObserver(update);
  for (const section of [game, ready, answer, finished]) observer.observe(section, {attributes:true, attributeFilter:['class']});
  if (question) observer.observe(question, {attributes:true, attributeFilter:['data-length']});
  update();
})();

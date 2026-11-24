(() => {
  const start = Date.parse('2026-11-22T00:00:00-05:00');
  const gameDay = Date.parse('2026-11-28T00:00:00-05:00');
  const end = Date.parse('2026-11-29T00:00:00-05:00');
  const banner = document.getElementById('rivalry-banner');
  const clock = document.getElementById('rivalry-clock');
  const detail = document.getElementById('rivalry-detail');
  const link = document.getElementById('basement-game-day-link');
  const normalLink = link.getAttribute('href');
  const root = document.documentElement;
  let kickoff = Date.parse('2026-11-28T17:00Z');
  let line = 'Spread and total pending';
  let state = 'pre';
  let nextFetch = 0;

  async function refreshMatch() {
    try {
      const response = await fetch('./data/daily-line-feed.json', {cache:'no-store'});
      if (!response.ok) return;
      const feed = await response.json();
      const game = feed.games.find(item => item.id === '401858540');
      if (!game) return;
      if (Number.isFinite(Date.parse(game.date))) kickoff = Date.parse(game.date);
      state = game.state;
      line = [game.odds?.spread, game.odds?.total != null && 'O/U ' + game.odds.total]
        .filter(Boolean).join('  •  ') || 'Spread and total pending';
    } catch (_) { /* The matchup and countdown also work offline. */ }
  }

  function render() {
    const now = Date.now();
    const active = now >= start && now < end;
    const saturday = active && now >= gameDay;
    const dayChanged = saturday !== root.hasAttribute('data-rivalry-day');
    root.toggleAttribute('data-rivalry-day', saturday);
    if (dayChanged) updateGameDay();
    if (active === banner.hidden) {
      banner.hidden = !active;
      root.toggleAttribute('data-rivalry', active);
      link.setAttribute('href', active ? './game-day.html?team=osu' : normalLink);
    }
    if (!active) return;
    if (now >= nextFetch) {
      nextFetch = now + 600000;
      refreshMatch();
    }
    const minutes = Math.ceil((kickoff - now) / 60000);
    clock.textContent = minutes > 0
      ? 'Kickoff in ' + Math.floor(minutes / 1440) + 'd ' + Math.floor(minutes % 1440 / 60) + 'h ' + minutes % 60 + 'm'
      : state === 'post' ? 'The Game • Final' : 'Buckeye Game Day • Go Bucks!';
    const details = ['Michigan at Ohio State  •  FOX', line,
      'The first meeting was in 1897.', '1969–1978  •  The Ten Year War'];
    detail.textContent = details[Math.floor(now / 8000) % details.length];
  }
  render();
  setInterval(render, 1000);
})();

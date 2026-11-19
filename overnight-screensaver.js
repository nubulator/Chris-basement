/* Overnight display, midnight to 7 AM Eastern. */
(() => {
  'use strict';
  const garage = document.currentScript.hasAttribute('data-garage');
  const key = garage ? 'jim.amy.garage.nightMode.enabled' : 'chris.basement.overnightScreensaver.enabled';
  const skip = new URLSearchParams(location.search).has('noScreensaver');
  const eastern = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', hour:'2-digit', hourCycle:'h23'});
  const wakeLength = 5 * 60 * 1000;
  let enabled = !garage;
  let wakeUntil = 0;
  let graceUntil = Date.now() + 5000;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) enabled = saved === 'true';
  } catch {}

  function init() {
    const header = document.querySelector('header .header-right');
    if (!header || document.getElementById('overnightScreensaverToggle')) return;
    const actions = header.querySelector('.basement-header-actions');
    if (actions) {
      while (actions.firstChild) header.insertBefore(actions.firstChild, actions);
      actions.remove();
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'overnightScreensaverToggle';
    toggle.title = 'Night Mode runs from midnight to 7 AM Eastern';
    header.insertBefore(toggle, header.querySelector('#status'));

    const style = document.createElement('style');
    style.textContent = "#nightModeSaver[hidden]{display:none!important}\n#nightModeSaver:not([hidden]){position:fixed;z-index:2147483647;inset:0;display:block;box-sizing:border-box;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;border-radius:0;background:#05090e!important;color:#aebec4!important;overflow:hidden;isolation:isolate}\n#nightModeOpen{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;border-radius:0;background:transparent!important;color:inherit!important;text-align:left;box-shadow:none!important;opacity:1!important;-webkit-appearance:none;appearance:none}\n#nightModeOpen:focus-visible{outline:2px solid #6e8992;outline-offset:-5px}\n.night-mode-message{position:absolute;left:50%;top:50%;display:grid;gap:.45em;text-align:center;white-space:nowrap;transform:translate(-50%,-50%);animation:ison-night-drift 90s ease-in-out infinite alternate}\n/* Night Mode orbs */\n#nightModeOpen::before,\n#nightModeOpen::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  animation: night-orb-float 64s ease-in-out infinite alternate;\n}\n#nightModeOpen::before {\n  background:\n    radial-gradient(circle closest-side, #28534d 0%, #173732 44%, transparent 100%) 19% 29% / clamp(52px, 9vmin, 125px) clamp(52px, 9vmin, 125px) no-repeat,\n    radial-gradient(circle closest-side, #48395e 0%, #302542 45%, transparent 100%) 76% 70% / clamp(44px, 8vmin, 110px) clamp(44px, 8vmin, 110px) no-repeat;\n}\n#nightModeOpen::after {\n  background:\n    radial-gradient(circle closest-side, #5c402f 0%, #39271e 43%, transparent 100%) 72% 19% / clamp(37px, 6vmin, 90px) clamp(37px, 6vmin, 90px) no-repeat,\n    radial-gradient(circle closest-side, #2c445f 0%, #1a293e 48%, transparent 100%) 30% 79% / clamp(60px, 10vmin, 140px) clamp(60px, 10vmin, 140px) no-repeat;\n  animation-duration: 83s;\n  animation-direction: alternate-reverse;\n}\n#nightModeOpen .night-mode-message { z-index: 1; }\n@keyframes night-orb-float {\n  0% { transform: translate(-5%, 3%); }\n  34% { transform: translate(7%, -10%); }\n  68% { transform: translate(-4%, -2%); }\n  100% { transform: translate(4%, 10%); }\n}\n@media (prefers-reduced-motion: reduce) {\n  #nightModeOpen::before, #nightModeOpen::after { animation: none; }\n}\n.night-mode-message strong{font-size:clamp(20px,3vw,42px);font-weight:500}\n.night-mode-message small{font-size:clamp(14px,1.5vw,22px)}\n@keyframes ison-night-drift{\n  0%{left:38%;top:35%}\n  35%{left:62%;top:43%}\n  70%{left:44%;top:65%}\n  100%{left:58%;top:31%}\n}\n@media(prefers-reduced-motion:reduce){.night-mode-message{animation:none}}\n";
    document.head.appendChild(style);
    const saver = document.createElement('div');
    saver.id = 'nightModeSaver';
    saver.hidden = true;
    saver.setAttribute('role', 'dialog');
    saver.setAttribute('aria-modal', 'true');
    saver.setAttribute('aria-label', 'Night Mode screensaver');
    saver.innerHTML = '<button id="nightModeOpen" type="button"><span class="night-mode-message"><strong></strong><small>Press Select to open dashboard</small></span></button>';
    saver.querySelector('strong').textContent = garage ? 'Jim & Amy’s Garage' : 'Chris’s Basement';
    document.body.appendChild(saver);
    const openDashboard = saver.querySelector('button');

    function update() {
      const now = Date.now();
      const overnight = !skip && Number(eastern.format(now)) < 7;
      const seconds = Math.max(0, Math.ceil((graceUntil - now) / 1000));
      const status = 'Night Mode ' + (enabled ? 'On' : 'Off');
      const label = status + (enabled && overnight && seconds ? ' (' + seconds + 's)' : '');
      if (toggle.textContent !== label) {
        toggle.textContent = label;
        toggle.setAttribute('aria-pressed', String(enabled));
      }
      const show = enabled && overnight && now >= graceUntil && now >= wakeUntil;
      if (show && saver.hidden) {
        saver.hidden = false;
        openDashboard.focus();
      } else if (!show && !saver.hidden) {
        saver.hidden = true;
        toggle.focus();
      }
    }

    toggle.addEventListener('click', () => {
      enabled = !enabled;
      wakeUntil = 0;
      if (enabled) graceUntil = Date.now() + 5000;
      try { localStorage.setItem(key, String(enabled)); } catch {}
      update();
    });
    openDashboard.addEventListener('click', () => {
      wakeUntil = Date.now() + wakeLength;
      update();
    });
    window.addEventListener('keydown', event => {
      if (saver.hidden) return;
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Select') {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!event.repeat) openDashboard.click();
      } else if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openDashboard.focus();
      }
    }, true);
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    setInterval(update, 1000);
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();

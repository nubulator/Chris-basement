/* Ison home navigation, shared by the family displays. */
(() => {
  'use strict';
  if (document.querySelector('[data-ison-home-nav]')) return;
  const config = document.currentScript?.dataset || {};
  const page = config.page || '';
  const isCalendar = page === 'calendar';
  const isCommand = page === 'command';
  const isException = page === 'exception';
  const calendar = 'https://isonfamilyhome.com/';
  const command = 'http://127.0.0.1:4173/#home';
  const owned = new Set(['isonfamilyhome.com','ison-family-hub.web.app','ison-home-mobile-705590637292.web.app','bernie-bernie-family-card-night.nubulator.chatgpt.site']);
  const fire = /\bAFT[A-Z0-9]*\b|Fire[\s/-]?TV|AmazonWebAppPlatform/i.test(navigator.userAgent) || (/Silk\//i.test(navigator.userAgent) && !/Kindle|\bKF[A-Z0-9]+/i.test(navigator.userAgent));
  const incoming = new URL(location.href).searchParams.get('isonView');
  let carried = incoming;
  try {
    if (incoming === 'tv' || incoming === 'standard') sessionStorage.setItem('isonNavigationView',incoming);
    else carried = sessionStorage.getItem('isonNavigationView');
  } catch {}
  function tvMode() {
    if (fire) return true;
    if (isCalendar) return !!document.querySelector('#tvView')?.checked || document.body.dataset.deviceInput === 'tv';
    return carried === 'tv';
  }
  function familyUrl(url) {
    return owned.has(url.hostname) || (url.hostname === 'nubulator.github.io' && /^\/(Chris-basement|Jim-Amys-Garage)(\/|$)/i.test(url.pathname));
  }
  function carry(link) {
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const url = new URL(raw,location.href);
    if (!familyUrl(url) || (url.origin === location.origin && !isCalendar)) return;
    url.searchParams.set('isonView',tvMode() ? 'tv' : 'standard');
    link.href = url.href;
  }
  const nav = document.createElement('span');
  nav.dataset.isonHomeNav = '';
  nav.setAttribute('role','navigation');
  nav.setAttribute('aria-label','Ison home navigation');
  function add(label,href,icon) {
    const a = document.createElement('a');
    a.href = href;
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden','true');
    symbol.textContent = icon;
    a.append(symbol,document.createTextNode(label));
    nav.append(a);
    return a;
  }
  const cal = add('Ison Family Calendar',calendar,'▦');
  const cc = add('Ison Command Center',command,'⌂');
  const style = document.createElement('style');
  style.textContent = '[data-ison-home-nav]{display:inline-flex;flex:0 1 auto;flex-wrap:wrap;gap:5px;align-items:center;vertical-align:middle}[data-ison-home-nav] a{box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:.35em;min-height:32px;padding:4px 9px!important;border:1px solid #d7b878!important;border-radius:8px!important;background:#173139!important;color:#fff4da!important;font:600 clamp(12px,.9vw,15px)/1.15 system-ui,sans-serif!important;letter-spacing:normal!important;text-transform:none!important;text-shadow:none!important;text-decoration:none!important;white-space:nowrap}[data-ison-home-nav] a:focus{outline:3px solid #ffcd62!important;outline-offset:2px}[data-ison-home-nav] a[hidden],[data-ison-home-nav][hidden]{display:none!important}';
  document.head.append(style);
  function mount() {
    if (nav.isConnected) return;
    const anchor = config.anchor && document.querySelector(config.anchor);
    if (anchor) anchor.after(nav);
    else (document.querySelector('header') || document.body).prepend(nav);
  }
  function sync() {
    mount();
    const tv = tvMode();
    const phone = /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
    cal.hidden = isCalendar || (tv && isException);
    cc.hidden = tv || isCommand || (phone && !isCommand);
    nav.hidden = cal.hidden && cc.hidden;
    const imperial = document.querySelector('a[href="http://localhost:3002/"]');
    if (imperial) {
      imperial.textContent = 'Imperial Command';
      imperial.style.display = tv ? 'none' : '';
    }
    for (const a of document.querySelectorAll('a[href]')) carry(a);
  }
  document.addEventListener('click',event => {const a=event.target.closest?.('a[href]');if(a) carry(a);},true);
  document.addEventListener('change',event => {if(event.target.id==='tvView') setTimeout(sync,0);});
  window.addEventListener('hub-display-change',sync);
  window.addEventListener('pageshow',sync);
  sync();
})();

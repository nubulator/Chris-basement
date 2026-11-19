"use strict";
const board = document.querySelector("#board");
const storageKey = "game-room.house-rules.v1";
const roundMs = 600000;
const offerMs = 30000;
let game;
let panel = "";
try { game = JSON.parse(localStorage.getItem(storageKey)); } catch { game = null; }

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(game)); } catch { /* Play remains available without browser storage. */ }
}
function draw(deck, count, previous) {
  if (!deck.length) {
    for (let i = 0; i < count; i++) deck.push(i);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (deck[count - 1] === previous) [deck[0], deck[count - 1]] = [deck[count - 1], deck[0]];
  }
  return deck.pop();
}
function start(names) {
  game = {names, totals:names.map(() => 0), holder:null, since:0, rules:[], bets:[], final:false};
  nextRule();
}
function nextRule(at = Date.now()) {
  panel = "";
  game.phase = "rule";
  game.rule = draw(game.rules, houseRules.length, game.rule);
  game.until = at + roundMs;
  save();
  render();
}
function pass(to, at = Date.now()) {
  if (game.holder !== null) game.totals[game.holder] += Math.max(0, at - game.since);
  game.holder = to;
  game.since = at;
}
function offer(final, at = Date.now()) {
  panel = "";
  game.final = final;
  game.phase = "offer";
  game.until = at + offerMs;
  save();
  render();
}
function settle() {
  if (!game.final) return nextRule();
  pass(null);
  game.phase = "done";
  panel = "";
  save();
  render();
}
function question(opponent) {
  game.opponent = opponent;
  game.bet = draw(game.bets, barBets.length, game.bet);
  game.phase = "question";
  save();
  render();
}
function node(tag, value, parent = board, cls = "") {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  el.textContent = value;
  parent.appendChild(el);
  return el;
}
function button(parent, name, action, primary = false) {
  const el = node("button", name, parent, primary ? "primary" : "");
  el.onclick = action;
  return el;
}
function actions() { return node("div", "", board, "actions"); }
function title(label, name, detail = "", parent = board) {
  node("div", label, parent, "label");
  node("h1", name, parent);
  if (detail) node("p", detail, parent);
}
function seconds(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
}
function showPanel(name) { panel = name; render(); }
function render() {
  board.replaceChildren();
  if (!game) {
    if (panel === "names") {
      title("Keep Score", "Who’s playing?", "Enter first names or nicknames, separated by commas or new lines. The clock starts with the first catch.");
      const label = node("label", "Players");
      label.htmlFor = "players";
      const input = node("textarea", "");
      input.id = "players"; input.rows = 2; input.placeholder = "Chris, Beth, Jim, Amy";
      const err = node("p", ""); err.setAttribute("role","alert");
      const row = actions();
      button(row, "Start game", () => {
        const names = input.value.split(/[,\n]/).map(n => n.trim()).filter(Boolean);
        if (names.length < 2 || new Set(names.map(n => n.toLowerCase())).size !== names.length) {
          err.textContent = "Enter at least two different names. Use nicknames to tell players apart."; return;
        }
        start(names);
      }, true);
      button(row,"Back",() => showPanel(""));
    } else {
      title("The Family Room", "House Rules", "Put a chip on the table. First person caught breaking the rule takes it. Holding the chip? Catch someone else to pass it.");
      node("p", "Every ten minutes, the holder can challenge someone to a Bar Bet.");
      const row = actions();
      button(row, "Casual Play", () => start([]), true);
      button(row, "Keep Score", () => showPanel("names"));
    }
  } else if (game.phase === "done") {
    title("Last Call", game.names.length ? "Time on the chip" : "That’s the night.", game.names.length ? "Least time wins. Most time loses. Equal times share a place." : "Who ended up with the chip?");
    if (game.names.length) {
      const ranking = game.names.map((name,i) => ({name, time:Math.floor(game.totals[i]/1000)})).sort((a,b) => a.time-b.time);
      const list = node("ol","");
      let place = 1;
      ranking.forEach((entry,i) => {
        if (i && entry.time !== ranking[i-1].time) place = i+1;
        node("li", entry.name + " · " + seconds(entry.time*1000),list).value = place;
      });
    }
    button(actions(),"New night",() => {game=null;save();showPanel("");},true);
  } else if (panel === "last") {
    title("Last Call","One last challenge?", "Offer the chip holder a final Bar Bet, then end the night.");
    const row = actions();
    button(row,"Return to game",() => showPanel(""),true);
    button(row,"Call last round",() => offer(true));
  } else if (panel === "holders" || game.phase === "opponent") {
    const opponent = game.phase === "opponent";
    title("The chip", opponent ? "Pick your opponent." : "Who has the chip?");
    const row = actions();
    game.names.forEach((name,i) => {
      if (i === game.holder) return;
      button(row,name,() => {
        if (opponent) question(i);
        else { pass(i); save(); showPanel(""); }
      });
    });
    button(actions(),"Back",() => {
      if (opponent) { game.phase="offer";game.until=Date.now()+offerMs;save(); }
      showPanel("");
    });
  } else if (game.phase === "rule") {
    title("House rule",houseRules[game.rule]);
    node("p","Holding the chip? Catch someone breaking the rule to pass it.");
    if (game.names.length) node("p",game.holder === null ? "Chip on the table" : "Chip holder · " + game.names[game.holder]);
    node("div","",board,"label").id="timer";
    const row = actions();
    if (game.names.length) button(row,game.holder === null ? "First catch" : "Pass the chip",() => showPanel("holders"),true);
    button(row,"Skip rule",() => nextRule());
    button(row,"Keep this rule",() => {game.until=Date.now()+roundMs;save();updateClock();});
    button(row,"Last Call",() => showPanel("last"));
  } else if (game.phase === "offer") {
    title(game.final ? "Last Call" : "End of round","Bar Bet?", "Chip holder: choose one willing opponent before you see the question. Closest guess wins. A tie stays with the holder.");
    node("div","",board,"label").id="timer";
    const row = actions();
    if (!game.names.length || game.holder !== null) button(row,game.names.length ? "Choose opponent" : "Opponent ready",() => {
      if (!game.names.length) return question(null);
      game.phase="opponent";save();render();
    },true);
    button(row,game.final ? "Finish night" : "Next rule",settle);
  } else {
    const [prompt,answer] = barBets[game.bet];
    const card = node("section","",board,"paper");
    title("Bar Bet",prompt,game.names.length ? game.names[game.holder]+" vs. "+game.names[game.opponent] : "Both players guess out loud.",card);
    const row = actions();
    if (game.phase === "question") button(row,"Reveal answer",() => {game.phase="answer";save();render();},true);
    else {
      node("p","Answer · "+answer.toLocaleString("en-US"),card);
      button(row,"Holder wins · pass chip",() => {if(game.names.length) pass(game.opponent);settle();},true);
      button(row,"Loss or tie · keep chip",settle);
    }
  }
  updateClock();
  const first = board.querySelector("textarea,button");
  if (first) first.focus({preventScroll:true});
}
function updateClock() {
  const timer = document.getElementById("timer");
  if (timer) timer.textContent = (game.phase === "rule" ? "Next rule in " : "Offer closes in ") + seconds(game.until-Date.now());
}
function tick() {
  if (!game || panel || !["rule","offer"].includes(game.phase)) return;
  const now = Date.now();
  if (now < game.until) {updateClock();return;}
  if (game.phase === "offer") {settle();return;}
  if (now >= game.until+offerMs) {nextRule();return;}
  offer(false,game.until);
}
document.addEventListener("keydown",event => {
  if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
  if (event.target.tagName === "TEXTAREA" && event.key !== "ArrowDown") return;
  const controls = Array.from(document.querySelectorAll("a, button, textarea"));
  const current = document.activeElement.getBoundingClientRect();
  const horizontal = ["ArrowLeft","ArrowRight"].includes(event.key);
  const sign = ["ArrowRight","ArrowDown"].includes(event.key) ? 1 : -1;
  let target, best = Infinity;
  for (const control of controls) {
    const rect = control.getBoundingClientRect();
    const dx = rect.left+rect.width/2-current.left-current.width/2;
    const dy = rect.top+rect.height/2-current.top-current.height/2;
    const along = sign*(horizontal?dx:dy);
    const cost = along+3*Math.abs(horizontal?dy:dx);
    if (along>1 && cost<best) {best=cost;target=control;}
  }
  if(target){event.preventDefault();target.focus();}
});
render();
tick();
setInterval(tick,500);

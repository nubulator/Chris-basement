"use strict";
const board = document.querySelector("#board");
const restartButton = document.querySelector("#restartGame");
const storageKey = "game-room.house-rules.v1";
const roundMs = 600000;
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
    if (deck[count - 1] === previous && count > 1) [deck[0], deck[count - 1]] = [deck[count - 1], deck[0]];
  }
  return deck.pop();
}
function start(names) {
  game = {names, totals:names.map(() => 0), holder:null, since:0, rules:[], phase:"rule"};
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
function offer(at = Date.now()) {
  panel = "";
  game.phase = "offer";
  game.until = at;
  save();
  render();
}
function finishGame() {
  if (game.holder !== null) pass(null);
  game.phase = "done";
  panel = "";
  save();
  render();
}
function settle() {
  nextRule();
}
function question(opponent) {
  game.opponent = opponent;
  const difficulty = ["Easy","Medium","Hard"][Math.floor(Math.random() * 3)];
  const choices = barBets.map((bet,index) => ({bet,index})).filter(item => item.bet.difficulty === difficulty);
  let picked = choices[Math.floor(Math.random() * choices.length)];
  if (choices.length > 1 && picked.index === game.bet) picked = choices[(choices.findIndex(item => item.index === picked.index) + 1) % choices.length];
  game.bet = picked.index;
  game.betDifficulty = difficulty;
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
  restartButton.hidden = !game;
  if (panel === "restart") {
    title("Start over", "Restart this game?", "The current names and chip-time scores will be cleared.");
    const row = actions();
    button(row, "Keep playing", () => showPanel(""), true);
    button(row, "Start a new game", () => { game = null; save(); showPanel(""); });
  } else if (!game) {
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
      title("The Family Room", "House Rules", "Pass a chip when someone breaks the rule. Every ten minutes, the chip holder can offer a Bar Bet.");
      const row = actions();
      button(row, "Casual Play", () => start([]), true);
      button(row, "Keep Score", () => showPanel("names"));
    }
  } else if (game.phase === "done") {
    title("Night complete", game.names.length ? "Time on the chip" : "That’s the night.", game.names.length ? "Least time wins. Most time loses. Equal times share a place." : "Who ended up with the chip?");
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
  } else if (panel === "end") {
    title("End game", "Finish the night now?", "Your chip-time totals will be saved on the final screen.");
    const row = actions();
    button(row, "Keep playing", () => showPanel(""), true);
    button(row, "Finish the night", finishGame);
  } else if (panel === "holders" || game.phase === "opponent") {
    title("Choose a challenger", "Who will take the Bar Bet?", "The chip holder picks one willing opponent.");
    const row = actions();
    game.names.forEach((name,i) => {
      if (i === game.holder) return;
      button(row,name,() => question(i));
    });
    button(actions(),"Back",() => { game.phase="offer"; save(); showPanel(""); },true);
  } else if (game.phase === "rule") {
    title("House rule",houseRules[game.rule]);
    node("p","If you’re holding the chip, catch someone breaking the rule to pass it.");
    if (game.names.length) node("p",game.holder === null ? "Chip on the table" : "Chip holder · " + game.names[game.holder]);
    node("div","",board,"label").id="timer";
    const row = actions();
    if (game.names.length) button(row,game.holder === null ? "First catch" : "Pass the chip",() => showPanel("holders"),true);
    button(row,"Skip rule",() => nextRule());
    button(row,"Keep this rule",() => {game.until=Date.now()+roundMs;save();updateClock();});
    button(row,"End game",() => showPanel("end"));
  } else if (game.phase === "offer") {
    title("10-minute check-in","Bar Bet?", "The chip holder may choose someone for a quick challenge, or skip ahead to the next house rule.");
    const row = actions();
    if (!game.names.length) button(row,"Choose a willing opponent",() => question(null),true);
    else if (game.holder !== null) button(row,"Choose opponent",() => {game.phase="opponent";save();render();},true);
    else node("p","The chip is on the table, so there’s no holder to call the Bar Bet.");
    button(row,"Skip Bar Bet · Next rule",settle);
    button(row,"End game",() => showPanel("end"));
  } else if (game.phase === "question" || game.phase === "answer") {
    const bet = barBets[game.bet];
    const card = node("section","",board,"paper");
    title(game.betDifficulty + " Bar Bet",bet.question,game.names.length ? game.names[game.holder]+" vs. "+game.names[game.opponent] : "Both players guess out loud.",card);
    const row = actions();
    if (game.phase === "question") button(row,"Reveal answer",() => {game.phase="answer";save();render();},true);
    else {
      node("p","Answer · "+bet.answer.toLocaleString("en-US"),card);
      button(row,"Holder wins · pass chip",() => {if(game.names.length) pass(game.opponent);settle();},true);
      button(row,"Opponent wins · holder keeps chip",settle);
    }
    button(actions(),"End game",() => showPanel("end"));
  }
  updateClock();
  const first = board.querySelector("textarea,button");
  if (first) first.focus({preventScroll:true});
}
function updateClock() {
  const timer = document.getElementById("timer");
  if (timer && game && game.phase === "rule") timer.textContent = "Bar Bet check-in in " + seconds(game.until-Date.now());
}
function tick() {
  if (!game || panel || game.phase !== "rule") return;
  const now = Date.now();
  if (now >= game.until) offer(now);
  else updateClock();
}
restartButton.addEventListener("click", () => showPanel("restart"));
document.addEventListener("keydown",event => {
  if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
  if (event.target.tagName === "TEXTAREA" && event.key !== "ArrowDown") return;
  const controls = Array.from(document.querySelectorAll("a, button, textarea")).filter(control => !control.hidden);
  const current = document.activeElement;
  if (!current || !current.getBoundingClientRect) return;
  const origin=current.getBoundingClientRect();
  const ox=origin.left+origin.width/2,oy=origin.top+origin.height/2;
  const horizontal = ["ArrowLeft","ArrowRight"].includes(event.key);
  const sign = ["ArrowRight","ArrowDown"].includes(event.key) ? 1 : -1;
  let target, best = Infinity;
  for (const control of controls) {
    if(control===current)continue;
    const rect = control.getBoundingClientRect();
    const dx=rect.left+rect.width/2-ox,dy=rect.top+rect.height/2-oy;
    const along=sign*(horizontal?dx:dy);
    const cost=along+3*Math.abs(horizontal?dy:dx);
    if (along>1 && cost<best) {best=cost;target=control;}
  }
  if(target){event.preventDefault();target.focus();}
});
render();
tick();
setInterval(tick,500);

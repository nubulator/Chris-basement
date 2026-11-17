#!/usr/bin/env python3
"""Cache published ESPN odds; reject incomplete refreshes and never invent a line."""
import concurrent.futures
import datetime as dt
import json
import math
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

SPORTS = {
    "NFL": ("football/nfl", ""),
    "NCAA FOOTBALL": ("football/college-football", "&groups=80"),
    "NCAA MEN": ("basketball/mens-college-basketball", "&groups=50"),
    "NBA": ("basketball/nba", ""),
    "NHL": ("hockey/nhl", ""),
    "MLB": ("baseball/mlb", ""),
}
ROOT = "https://site.api.espn.com/apis/site/v2/sports/"
OUTPUT = Path("data/daily-line-feed.json")
FAVORITES = {"NFL": {"4", "5"}, "NCAA FOOTBALL": {"194"}, "NCAA MEN": {"194"},
             "NBA": {"5"}, "NHL": {"29"}, "MLB": {"17"}}
BIG_TEN = {"194", "130", "127", "213", "275", "135", "2294", "158", "356",
           "77", "84", "2509", "164", "120", "2483", "264", "26", "30"}


def fetch(path, suffix):
    url = ROOT + path + suffix
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "IsonDashboardFeed/1.1", "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=18) as response:
                return json.load(response)
        except (OSError, ValueError):
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def scalar(value):
    if isinstance(value, dict):
        return scalar(value.get("displayValue", value.get("value")))
    if value is None or isinstance(value, bool):
        return None
    text = str(value).strip()
    return None if text.lower() in ("", "unavailable", "pending", "not published", "—", "--", "nan") else text


def as_list(value):
    return value if isinstance(value, list) else [value] if isinstance(value, dict) else []


def odds_options(payload):
    comp = (payload.get("competitions") or [{}])[0]
    header = ((payload.get("header") or {}).get("competitions") or [{}])[0]
    return (as_list(payload.get("pickcenter")) + as_list(payload.get("odds")) +
            as_list(header.get("odds")) + as_list(comp.get("odds")))


def parse_option(option, home_abbr="", league=""):
    spread = None if league in ("NHL", "MLB") else scalar(option.get("details"))
    point = option.get("pointSpread") or {}
    home_line = scalar(((point.get("home") or {}).get("close") or {}).get("line"))
    if spread is None and home_abbr and home_line is not None:
        spread = home_abbr + " " + home_line
    # ESPN's numeric spread is relative to the home team. Keep it labeled.
    if spread is None and home_abbr and scalar(option.get("spread")) is not None:
        try:
            number = float(option["spread"])
            if math.isfinite(number):
                spread = f"{home_abbr} {number:+g}"
        except (TypeError, ValueError):
            pass
    total = scalar(option.get("overUnder", option.get("over_under")))
    for side in ("over", "under"):
        if total is None:
            total = scalar((((option.get("total") or {}).get(side) or {}).get("close") or {}).get("line"))
    try:
        total = float(re.sub(r"^[ou]\s*", "", total, flags=re.I)) if total is not None else None
        if total is not None and (not math.isfinite(total) or total <= 0):
            total = None
    except (ValueError, TypeError):
        total = None
    return {"spread": spread, "total": total}


def parse_odds(event, home_abbr="", league=""):
    options = [parse_option(o, home_abbr, league) for o in odds_options(event)]
    return next((o for o in options if o["spread"] is not None and o["total"] is not None),
                next((o for o in options if any(v is not None for v in o.values())), {"spread": None, "total": None}))


def normalize(event, league, rankings=None, big_ten=False):
    comp = (event.get("competitions") or [{}])[0]
    competitors = comp.get("competitors") or []
    away = next((x for x in competitors if x.get("homeAway") == "away"), None)
    home = next((x for x in competitors if x.get("homeAway") == "home"), None)
    if not away or not home or not event.get("id"):
        return None
    try:
        dt.datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
    except (KeyError, ValueError, TypeError, AttributeError):
        return None
    def rank(team):
        value = (rankings or {}).get(str(team.get("id"))) or (team.get("curatedRank") or {}).get("current", 0)
        return int(value) if str(value).isdigit() and 1 <= int(value) <= 25 else 0
    def record(team):
        entries = team.get("records") or []
        total = next((r for r in entries if r.get("type") == "total" or r.get("name") == "overall"), {})
        value = str(total.get("summary", ""))
        return value if re.fullmatch(r"\d+-\d+(?:-\d+)?", value) else ""
    a, h = away.get("team") or {}, home.get("team") or {}
    ids = {str(a.get("id")), str(h.get("id"))}
    state = (event.get("status") or comp.get("status") or {}).get("type", {})
    result = {
        "id": str(event["id"]), "league": league, "date": event["date"], "state": state.get("state"),
        "status": state.get("shortDetail", "Scheduled"),
        "away": a.get("shortDisplayName") or a.get("displayName"),
        "home": h.get("shortDisplayName") or h.get("displayName"),
        "awayId": str(a.get("id", "")), "homeId": str(h.get("id", "")),
        "homeAbbr": h.get("abbreviation", ""),
        "awayLogo": a.get("logo", ""), "homeLogo": h.get("logo", ""),
        "awayRecord": record(away), "homeRecord": record(home), "ar": rank(away), "hr": rank(home),
        "fav": bool(ids & FAVORITES.get(league, set())),
        "bigTen": league == "NCAA FOOTBALL" and (big_ten or bool(ids & BIG_TEN)),
        "odds": parse_odds(event, h.get("abbreviation", ""), league),
    }
    result["top25"] = bool(result["ar"] or result["hr"])
    return result if result["away"] and result["home"] else None


def eligible(game):
    league = game["league"]
    return (league == "NFL" or league == "NCAA FOOTBALL" and (game["top25"] or game["bigTen"] or game["fav"]) or
            league == "NCAA MEN" and (game["top25"] or game["fav"]) or
            league in ("NBA", "NHL", "MLB") and game["fav"])


def enrich_missing_odds(games, now):
    near = [g for g in games.values() if g["state"] != "post" and eligible(g) and
            dt.datetime.fromisoformat(g["date"].replace("Z", "+00:00")) >= now - dt.timedelta(hours=3) and
            any(v is None for v in g["odds"].values())]
    near.sort(key=lambda g: (not g["fav"], g["date"]))
    def enrich(game):
        suffix = "/summary?event=" + urllib.parse.quote(game["id"])
        try:
            payload = fetch(SPORTS[game["league"]][0], suffix)
            odds = parse_odds(payload, game["homeAbbr"], game["league"])
            if all(v is not None for v in odds.values()) or (all(v is None for v in game["odds"].values()) and any(v is not None for v in odds.values())):
                game["odds"] = odds
                game["oddsSource"] = ROOT + SPORTS[game["league"]][0] + suffix
            return True
        except (OSError, ValueError, KeyError, TypeError):
            return False
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        return sum(pool.map(enrich, near[:60]))


def build(now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    today = now.astimezone(ZoneInfo("America/New_York")).date()
    rankings = {}
    for league in ("NCAA FOOTBALL", "NCAA MEN"):
        payload = fetch(SPORTS[league][0], "/rankings")
        polls = payload.get("rankings") or []
        poll = next((p for p in polls if re.search(r"AP Top 25|AP Poll", p.get("name", ""), re.I)), polls[0] if polls else {})
        rankings[league] = {str(r["team"]["id"]): r["current"] for r in poll.get("ranks", [])}
    jobs = [(league, path, extra, (today + dt.timedelta(days=offset)).strftime("%Y%m%d"))
            for league, (path, extra) in SPORTS.items() for offset in range(9)]
    jobs += [("NCAA FOOTBALL", "football/college-football", "&groups=5", (today + dt.timedelta(days=i)).strftime("%Y%m%d")) for i in range(9)]
    def scoreboard(job):
        league, path, extra, day = job
        suffix = "/scoreboard?limit=500&dates=" + day + extra
        payload = fetch(path, suffix)
        if not isinstance(payload.get("events"), list):
            raise ValueError(f"Missing events array: {path} {day}")
        return job, payload["events"], ROOT + path + suffix
    games = {}
    # Any failed/malformed scoreboard aborts before the last-good file is touched.
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for (league, path, extra, day), events, source in pool.map(scoreboard, jobs):
            for event in events:
                game = normalize(event, league, rankings.get(league), extra == "&groups=5")
                if game is None:
                    raise ValueError(f"Malformed ESPN event: {league} {event.get('id')}")
                game["oddsSource"] = source
                key = league + ":" + game["id"]
                if key in games:
                    game["bigTen"] |= games[key]["bigTen"]
                games[key] = game
    if not games:
        raise RuntimeError("Empty ESPN refresh; retaining last-good feed")
    # A favorite may have a bye: preserve its next game even beyond nine days.
    schedule_jobs = [(league, team_id) for league, ids in FAVORITES.items() for team_id in sorted(ids)]
    def schedule(job):
        league, team_id = job
        suffix = "/teams/" + team_id + "/schedule?limit=300"
        payload = fetch(SPORTS[league][0], suffix)
        if not isinstance(payload.get("events"), list):
            raise ValueError(f"Missing schedule events: {league} {team_id}")
        candidates = [normalize(e, league, rankings.get(league)) for e in payload["events"]]
        candidates = [g for g in candidates if g and g["state"] != "post" and
                      dt.datetime.fromisoformat(g["date"].replace("Z", "+00:00")) >= now - dt.timedelta(hours=3)]
        if not candidates:
            return None
        game = min(candidates, key=lambda g: g["date"])
        game["oddsSource"] = ROOT + SPORTS[league][0] + suffix
        return game
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for game in pool.map(schedule, schedule_jobs):
            if game:
                games.setdefault(game["league"] + ":" + game["id"], game)
    enriched = enrich_missing_odds(games, now)
    return {"schema": 1, "generatedAt": now.isoformat(), "source": "ESPN scoreboard and event summary",
            "successfulRequests": len(jobs), "failedRequests": 0, "summaryRequests": enriched,
            "scheduleRequests": len(schedule_jobs), "coverage": {league: 9 for league in SPORTS},
            "games": sorted(games.values(), key=lambda x: (x["date"], x["league"], x["id"]))}


def main():
    result = build()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUTPUT.with_suffix(".tmp")
    temporary.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n")
    temporary.replace(OUTPUT)
    complete = sum(all(v is not None for v in g["odds"].values()) for g in result["games"])
    print(f"Cached {len(result['games'])} games; {complete} with spread + total; {result['successfulRequests']} scoreboards, {result['summaryRequests']} summaries, zero failed scoreboards", flush=True)


if __name__ == "__main__":
    main()

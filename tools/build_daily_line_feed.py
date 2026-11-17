#!/usr/bin/env python3
"""Build a public, read-only ESPN scoreboard cache for Daily Line.
No betting lines are synthesized: absent ESPN odds remain null.
"""
import datetime as dt
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

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


def fetch(path, suffix):
    url = ROOT + path + suffix
    req = urllib.request.Request(url, headers={"User-Agent": "IsonDashboardFeed/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=18) as response:
        return json.load(response)


def parse_odds(event):
    comp = (event.get("competitions") or [{}])[0]
    for odds in comp.get("odds") or []:
        spread = odds.get("details") or odds.get("spread")
        total = odds.get("overUnder")
        if spread is not None or total is not None:
            return {"spread": spread, "total": total}
    return {"spread": None, "total": None}


def normalize(event, league):
    comp = (event.get("competitions") or [{}])[0]
    competitors = comp.get("competitors") or []
    away = next((x for x in competitors if x.get("homeAway") == "away"), None)
    home = next((x for x in competitors if x.get("homeAway") == "home"), None)
    if not away or not home:
        return None
    return {
        "id": str(event.get("id", "")), "league": league,
        "date": event.get("date"), "state": (event.get("status") or {}).get("type", {}).get("state"),
        "away": (away.get("team") or {}).get("shortDisplayName") or (away.get("team") or {}).get("displayName"),
        "home": (home.get("team") or {}).get("shortDisplayName") or (home.get("team") or {}).get("displayName"),
        "awayLogo": (away.get("team") or {}).get("logo"),
        "homeLogo": (home.get("team") or {}).get("logo"),
        "odds": parse_odds(event),
    }


def main():
    now = dt.datetime.now(dt.timezone.utc)
    games = {}
    errors = []
    successes = 0
    for league, (path, extra) in SPORTS.items():
        for offset in range(9):
            day = (now + dt.timedelta(days=offset)).strftime("%Y%m%d")
            try:
                payload = fetch(path, "?limit=500&dates=" + day + extra)
                successes += 1
                for event in payload.get("events", []):
                    game = normalize(event, league)
                    if game and game["id"]:
                        key = league + ":" + game["id"]
                        old = games.get(key)
                        if old and not game["odds"]["spread"] and not game["odds"]["total"]:
                            game["odds"] = old["odds"]
                        games[key] = game
            except (urllib.error.URLError, TimeoutError, ValueError, KeyError) as exc:
                errors.append({"league": league, "day": day, "error": type(exc).__name__})
            time.sleep(0.05)
    if successes < 6:
        raise RuntimeError(f"Only {successes} ESPN scoreboard requests succeeded; refusing to replace feed")
    result = {
        "schema": 1, "generatedAt": now.isoformat(), "source": "ESPN scoreboard",
        "successfulRequests": successes, "failedRequests": len(errors),
        "games": sorted(games.values(), key=lambda x: x["date"] or ""),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Cached {len(games)} games from {successes} requests; {len(errors)} failed")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Offline checks for ESPN feed normalization. No network calls or production writes."""
import importlib.util
import unittest
import tempfile
import datetime as dt
from unittest.mock import patch
from pathlib import Path

spec = importlib.util.spec_from_file_location("daily_line", Path(__file__).with_name("build_daily_line_feed.py"))
feed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(feed)

def event(odds=None):
    return {
        "id": "40123456", "date": "2026-11-17T00:00Z",
        "status": {"type": {"state": "pre"}},
        "competitions": [{
            "competitors": [
                {"homeAway": "away", "team": {"shortDisplayName": "Browns", "logo": "https://example.com/away.png"}},
                {"homeAway": "home", "team": {"shortDisplayName": "Steelers", "logo": "https://example.com/home.png"}},
            ],
            "odds": odds or [],
        }],
    }

class FeedTests(unittest.TestCase):
    def test_published_odds(self):
        result = feed.normalize(event([{"details": "PIT -3.5", "overUnder": 42.5}]), "NFL")
        self.assertEqual(result["odds"], {"spread": "PIT -3.5", "total": 42.5})
        self.assertEqual(result["away"], "Browns")
        self.assertEqual(result["home"], "Steelers")

    def test_missing_odds_remain_missing(self):
        self.assertEqual(feed.normalize(event(), "NFL")["odds"], {"spread": None, "total": None})

    def test_partial_odds(self):
        self.assertEqual(feed.normalize(event([{"overUnder": 44}]), "NFL")["odds"], {"spread": None, "total": 44})

    def test_missing_competitors(self):
        self.assertIsNone(feed.normalize({"id": "1", "competitions": [{}]}, "NFL"))

class SafetyTests(unittest.TestCase):
    def test_zero_spread_is_retained_and_labeled(self):
        self.assertEqual(feed.parse_odds({"odds": [{"spread": 0, "overUnder": 44}]}, "CLE"), {"spread": "CLE +0", "total": 44})

    def test_hockey_moneyline_is_not_a_point_spread(self):
        odds = {"details": "NYI -142", "spread": -1.5, "overUnder": 5.5,
                "pointSpread": {"home": {"close": {"line": "-1.5"}}}}
        self.assertEqual(feed.parse_odds({"odds": [odds]}, "NYI", "NHL"), {"spread": "NYI -1.5", "total": 5.5})
        self.assertIsNone(feed.parse_odds({"odds": [{"details": "NYI -142"}]}, "NYI", "NHL")["spread"])

    def test_structured_totals_and_missing_placeholders(self):
        self.assertEqual(feed.parse_odds({"odds": [{"details": "—", "total": {"over": {"close": {"line": "o42.5"}}}}]}), {"spread": None, "total": 42.5})
        self.assertEqual(feed.parse_odds({"odds": [{"details": "Pending", "overUnder": "NaN"}]}), {"spread": None, "total": None})

    def test_failed_refresh_never_replaces_last_good_file(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "feed.json"
            output.write_text("last-good")
            with patch.object(feed, "OUTPUT", output), patch.object(feed, "build", side_effect=RuntimeError("ESPN down")):
                with self.assertRaises(RuntimeError): feed.main()
            self.assertEqual(output.read_text(), "last-good")

    def test_wrong_endpoint_payload_is_rejected(self):
        with patch.object(feed, "fetch", return_value={}):
            with self.assertRaisesRegex(ValueError, "Missing events"):
                feed.build(dt.datetime(2026, 11, 17, tzinfo=dt.timezone.utc))

    def test_date_window_uses_eastern_day_after_utc_midnight(self):
        calls = []
        def fake_fetch(path, suffix):
            calls.append(suffix)
            return {"rankings": []} if suffix == "/rankings" else {"events": []}
        with patch.object(feed, "fetch", side_effect=fake_fetch):
            with self.assertRaisesRegex(RuntimeError, "Empty ESPN"):
                feed.build(dt.datetime(2026, 11, 17, 1, tzinfo=dt.timezone.utc))
        self.assertTrue(any("dates=20261116" in s for s in calls))
        self.assertFalse(any("dates=20261125" in s for s in calls))

    def test_rank_records_conference_and_favorite_ids_survive(self):
        e = event()
        a, h = e["competitions"][0]["competitors"]
        a.update(id="194", curatedRank={"current": 99}, records=[{"type": "total", "summary": "9-1"}])
        a["team"].update(id="194", shortDisplayName="Ohio State")
        result = feed.normalize(e, "NCAA FOOTBALL", {"194": 3})
        self.assertEqual(result["ar"], 3)
        self.assertEqual(result["awayRecord"], "9-1")
        self.assertTrue(result["bigTen"] and result["top25"] and result["fav"])

if __name__ == "__main__":
    unittest.main()

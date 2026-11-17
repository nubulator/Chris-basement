#!/usr/bin/env python3
"""Offline checks for ESPN feed normalization. No network calls or production writes."""
import importlib.util
import unittest
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

if __name__ == "__main__":
    unittest.main()

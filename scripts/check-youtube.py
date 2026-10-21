#!/usr/bin/env python3
"""
check-youtube.py
================
Confirms YouTube videos exist and are embeddable, via the public oEmbed
endpoint (no API key). Prints "<id>\t<title>\t<channel>" or "<id>\tNOT FOUND".

Usage: python3 scripts/check-youtube.py <id> [<id> ...]
       (or import lookup() from another script)
"""

import json
import sys
import urllib.error
import urllib.parse
import urllib.request


def lookup(video_id: str):
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(
        f"https://www.youtube.com/watch?v={video_id}", safe=""
    )
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.load(r)
        return {"title": data.get("title", ""), "channel": data.get("author_name", "")}
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError):
        return None


if __name__ == "__main__":
    for vid in sys.argv[1:]:
        info = lookup(vid)
        print(f"{vid}\t{info['title']}\t{info['channel']}" if info else f"{vid}\tNOT FOUND")

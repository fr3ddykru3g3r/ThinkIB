# Brief for writing an AMC 12 topic file

Quality bar: AoPS Intermediate books / Evan Chen handouts, not a glossary. Deep explanations with real derivations, and genuinely hard final problems.

1. Read /Volumes/T7/IBStuff28/ThinkIB/data/amc12/SCHEMA.md and follow it exactly.
2. Build the JSON with a Python generator script in your scratchpad dir (/private/tmp/claude-501/-Users-Kyrosah--claude-spares-spare-Lrk75E/88471310-bad4-4e32-81c3-0d8d53a49155/scratchpad/deep_<id>.py) so escaping is correct, then write /Volumes/T7/IBStuff28/ThinkIB/data/amc12/topics/<id>.json. Touch no other project file. If a v1 file already exists for the id, rewrite it to v2 (reuse good bits only).
3. ORIGINAL problems only. Solve each carefully; every `verify` must compute the answer independently (brute force where possible), never print a hard-coded number.
4. Videos: use WebSearch to find 2-4 real teaching videos, then confirm each id with `python3 /Volumes/T7/IBStuff28/ThinkIB/scripts/check-youtube.py <id> ...` and copy the exact title it prints. Never guess an id.
5. Run `python3 /Volumes/T7/IBStuff28/ThinkIB/scripts/validate-amc12.py /Volumes/T7/IBStuff28/ThinkIB/data/amc12/topics/<id>.json` and fix every error until it prints OK.
6. Reply with only the final validator line and counts (concepts / examples / problems / videos).

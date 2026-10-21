#!/usr/bin/env python3
"""Spread AMC 12 answer letters evenly across A–E for problems whose choices
are all plain numbers, by mirroring distractors across the correct answer.
Re-run validate-amc12.py afterwards."""
import glob, json, os, random, re, sys
from fractions import Fraction

sys.path.insert(0, os.path.dirname(__file__))
LETTERS = "ABCDE"

def num(c):
    t = c.replace("$", "").replace(" ", "")
    m = re.fullmatch(r"(-?)\\d?frac\{(-?\d+)\}\{(\d+)\}", t)
    if m:
        v = Fraction(int(m.group(2)), int(m.group(3)))
        return -v if m.group(1) else v
    try:
        return Fraction(t.replace(",", ""))
    except ValueError:
        return None

def fmt(v, like):
    if v.denominator == 1:
        return str(v.numerator)
    s = f"\\frac{{{abs(v.numerator)}}}{{{v.denominator}}}"
    return f"${'-' if v < 0 else ''}{s}$"

for path in sorted(glob.glob(os.path.join(os.path.dirname(__file__), "../data/amc12/topics/*.json"))):
    d = json.load(open(path))
    rng = random.Random(d["id"])
    items = d["workedExamples"] + d["problems"]
    targets = [LETTERS[i % 5] for i in range(len(items))]
    rng.shuffle(targets)
    for item, target in zip(items, targets):
        vals = [num(c) for c in item["choices"]]
        if any(v is None for v in vals):
            continue
        ans = vals[LETTERS.index(item["answer"])]
        want = LETTERS.index(target)
        below = sorted(v for v in vals if v < ans)
        above = sorted(v for v in vals if v > ans)
        while len(below) > want:             # move lowest distractor above
            v = below.pop(0); m = 2 * ans - v
            above.append(m if m not in above else max(above + [ans]) + (ans - v))
        while len(below) < want:             # move highest distractor below
            v = above.pop(); m = 2 * ans - v
            below.insert(0, m if m not in below else min(below + [ans]) - (v - ans))
        new = sorted(below) + [ans] + sorted(above)
        if len(set(new)) != 5 or (ans > 0 and any(x <= 0 for x in new) and all(x > 0 for x in vals)):
            continue                          # don't introduce negatives where none made sense
        item["choices"] = [fmt(v, None) if v not in vals else item["choices"][vals.index(v)] for v in new]
        item["answer"] = LETTERS[new.index(ans)]
    json.dump(d, open(path, "w"), indent=2, ensure_ascii=False)
    print(d["id"], "".join(sorted(p["answer"] for p in d["problems"])))

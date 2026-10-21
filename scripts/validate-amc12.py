#!/usr/bin/env python3
"""
validate-amc12.py
=================
Checks AMC 12 topic files against data/amc12/SCHEMA.md and runs every
`verify` snippet to confirm the keyed answer.

Usage: python3 scripts/validate-amc12.py [data/amc12/topics/*.json]
"""

import glob
import json
import os
import re
import subprocess
import sys
from fractions import Fraction

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LETTERS = "ABCDE"
DIFFICULTY_MIX = {1: 3, 2: 3, 3: 4, 4: 3, 5: 2}


def normalise(s: str) -> str:
    s = s.replace("$", "").replace(" ", "").replace("\\", "").replace("dfrac", "frac")
    s = s.replace("{", "").replace("}", "") if s.startswith("frac") or s.startswith("-frac") else s
    return s.strip().rstrip(".")


def as_number(s: str):
    t = normalise(s)
    try:
        if "frac" in t:
            raw = s.replace("$", "").replace(" ", "").replace("\\dfrac", "\\frac")
            m = re.fullmatch(r"(-?)\\frac\{(-?\d+)\}\{(\d+)\}", raw)
            if m:
                v = Fraction(int(m.group(2)), int(m.group(3)))
                return -v if m.group(1) else v
            return None
        return Fraction(t.replace(",", ""))
    except (ValueError, ZeroDivisionError):
        return None


def same(printed: str, choice: str) -> bool:
    a, b = as_number(printed), as_number(choice)
    if a is not None and b is not None:
        return a == b
    return normalise(printed) == normalise(choice)


def run_verify(code: str):
    try:
        out = subprocess.run([sys.executable, "-I", "-c", code], capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        return None, "verify timed out"
    if out.returncode != 0:
        return None, "verify crashed: " + out.stderr.strip().splitlines()[-1] if out.stderr.strip() else "verify crashed"
    lines = out.stdout.strip().splitlines()
    return (lines[-1].strip() if lines else ""), None


def check_mc(item, where, errors):
    choices = item.get("choices")
    if not isinstance(choices, list) or len(choices) != 5:
        errors.append(f"{where}: needs exactly 5 choices")
        return
    if len({normalise(c) for c in choices}) != 5:
        errors.append(f"{where}: choices are not distinct")
    if item.get("answer") not in LETTERS:
        errors.append(f"{where}: answer must be A–E")
        return
    nums = [as_number(c) for c in choices]
    if all(n is not None for n in nums) and nums != sorted(nums):
        errors.append(f"{where}: numeric choices not in increasing order")
    code = item.get("verify")
    if not code:
        errors.append(f"{where}: missing verify")
        return
    printed, err = run_verify(code)
    if err:
        errors.append(f"{where}: {err}")
        return
    keyed = choices[LETTERS.index(item["answer"])]
    if not same(printed, keyed):
        matches = [LETTERS[i] for i, c in enumerate(choices) if same(printed, c)]
        hint = f" (verify matches choice {matches[0]})" if matches else ""
        errors.append(f"{where}: verify printed {printed!r} but keyed answer is {item['answer']} = {keyed!r}{hint}")


def validate(path):
    errors = []
    with open(path) as f:
        try:
            d = json.load(f)
        except json.JSONDecodeError as e:
            return [f"invalid JSON: {e}"]
    stem = os.path.splitext(os.path.basename(path))[0]
    if d.get("id") != stem:
        errors.append(f"id {d.get('id')!r} does not match filename")
    for key in ("title", "summary", "examWeight"):
        if not d.get(key):
            errors.append(f"missing {key}")

    concepts = d.get("concepts", [])
    if not 4 <= len(concepts) <= 6:
        errors.append(f"needs 4–6 concepts, has {len(concepts)}")
    for i, c in enumerate(concepts):
        for key in ("title", "body", "keyFacts", "whenToUse"):
            if not c.get(key):
                errors.append(f"concept {i + 1}: missing {key}")

    examples = d.get("workedExamples", [])
    if len(examples) != 3:
        errors.append(f"needs exactly 3 worked examples, has {len(examples)}")
    for i, ex in enumerate(examples):
        for key in ("title", "problem", "steps", "takeaway"):
            if not ex.get(key):
                errors.append(f"example {i + 1}: missing {key}")
        check_mc(ex, f"example {i + 1}", errors)

    problems = d.get("problems", [])
    if len(problems) != 15:
        errors.append(f"needs exactly 15 problems, has {len(problems)}")
    ids = [p.get("id") for p in problems]
    if len(set(ids)) != len(ids):
        errors.append("problem ids are not unique")
    mix = {k: 0 for k in DIFFICULTY_MIX}
    for p in problems:
        where = f"problem {p.get('id')}"
        if p.get("difficulty") in mix:
            mix[p["difficulty"]] += 1
        else:
            errors.append(f"{where}: difficulty must be 1–5")
        for key in ("problem", "hint", "solution"):
            if not p.get(key):
                errors.append(f"{where}: missing {key}")
        check_mc(p, where, errors)
    if problems and mix != DIFFICULTY_MIX:
        errors.append(f"difficulty mix {mix} should be {DIFFICULTY_MIX}")
    return errors


def main():
    paths = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "data/amc12/topics/*.json")))
    failed = 0
    for path in paths:
        errors = validate(path)
        name = os.path.relpath(path, ROOT)
        if errors:
            failed += 1
            print(f"FAIL {name}")
            for e in errors:
                print(f"  - {e}")
        else:
            print(f"OK   {name}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()

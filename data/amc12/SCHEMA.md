# AMC 12 topic file schema (v2)

One JSON file per topic: `data/amc12/topics/<id>.json`. Validate with
`python3 scripts/validate-amc12.py data/amc12/topics/<id>.json`.

The bar is a serious competition-prep course (AoPS Intermediate books,
Brilliant, Evan Chen's handouts), not a glossary. Teach *why* things work,
show the moves strong solvers actually make, and make practice escalate to
genuine AMC 12 #20–25 difficulty.

All problems are ORIGINAL (written for this site). Never copy or paraphrase
real AMC/AIME problems and never claim a contest source.

Math: `$...$` inline, `$$...$$` display (KaTeX). Write money as `\\$5`. In
JSON every backslash is doubled: `"$\\frac{1}{2}$"`. Use `\n\n` between
paragraphs.

```jsonc
{
  "id": "number-theory",                 // kebab-case, matches filename
  "title": "Number Theory",
  "summary": "One sentence on what the topic covers on the AMC 12.",
  "examWeight": "≈4–5 problems per paper",
  "prerequisites": ["algebra"],          // other topic ids (may be empty)
  "overview": "2–3 paragraphs: what this topic looks like on the AMC 12, how problems escalate from #5 to #25, and how to study it.",

  "concepts": [                          // 8–10 lessons, basic → advanced
    {
      "title": "Modular arithmetic",
      "body": "4–8 paragraphs. Motivate the idea, state it precisely, PROVE or justify it, then show how it is used. Include at least one derivation.",
      "keyFacts": ["2–6 formulas/facts with $LaTeX$"],
      "whenToUse": "The signal in a problem that this idea applies.",
      "commonMistakes": ["1–3 specific traps students fall into"],
      "example": {                       // a short worked illustration (not multiple choice)
        "problem": "Find the last two digits of $7^{2024}$.",
        "solution": "Several sentences, fully worked.",
        "answer": "01",                  // the final answer as a string
        "verify": "python code that prints the answer"
      }
    }
  ],

  "strategies": [                        // 4–8 contest tactics for this topic
    { "name": "Work mod small primes first", "description": "2–4 sentences on how and when." }
  ],

  "workedExamples": [                    // exactly 6, difficulty 1→5 (at least two at 4–5)
    {
      "title": "Short title",
      "difficulty": 3,                   // 1–5, see below
      "problem": "Problem statement.",
      "choices": ["...", "...", "...", "...", "..."],
      "answer": "C",
      "approach": "1–2 sentences: how to spot the way in, before any algebra.",
      "steps": ["Step 1", "Step 2", "..."],     // 4–8 steps
      "alternative": "Optional: a second method in a few sentences (or empty string).",
      "takeaway": "One sentence: the reusable idea.",
      "verify": "python code that prints the correct value"
    }
  ],

  "problems": [                          // exactly 30
    {
      "id": "nt-01",                     // <prefix>-<2 digits>, unique
      "difficulty": 1,                   // 1 ≈ #1–5, 2 ≈ #6–10, 3 ≈ #11–15, 4 ≈ #16–20, 5 ≈ #21–25
      "problem": "Statement.",
      "choices": ["...", "...", "...", "...", "..."],
      "answer": "B",
      "hint": "One nudge that does not give the answer away.",
      "solution": "Full solution, several sentences with LaTeX; for difficulty ≥4 explain the key insight.",
      "concepts": [0, 3],                // indexes into "concepts" this problem uses
      "verify": "python code that prints the correct value"
    }
  ],

  "videos": [                            // 2–4 real YouTube videos, verified
    {
      "youtubeId": "dQw4w9WgXcQ",        // 11-char id
      "title": "Exact title as YouTube shows it",
      "channel": "Channel name",
      "why": "One sentence: what this video teaches and when to watch it."
    }
  ]
}
```

Difficulty mix for the 30 problems: 6×1, 6×2, 8×3, 6×4, 4×5.

## `verify`

A standalone Python 3 snippet (standard library only: `fractions`,
`itertools`, `math`, `cmath`, `functools`) that independently COMPUTES the
answer, by brute force where possible, and prints it. The validator compares
the printed text with the keyed choice: it strips `$`, spaces and `\\`, and
compares numerically when both parse as numbers (fractions like `3/4` or
`\\frac{3}{4}` are parsed; `\\sqrt{2}` is not, so for irrational answers
assert the value numerically inside the snippet, then print the exact choice
string, e.g. `print("2\\\\sqrt{3}")`). Never just print a hard-coded number
without computing it.

Choices must be distinct, increasing when numeric, positive when the quantity
can't be negative, and the wrong ones should be plausible mistakes. Spread
the answer letters roughly evenly across A–E.

## `videos`

Only include a video you have confirmed exists: run
`python3 scripts/check-youtube.py <id> [<id> ...]`, which prints each id's
real title and channel (or NOT FOUND). Prefer AoPS, 3Blue1Brown, Michael
Penn, Mathologer, Khan Academy, Numberphile, Richard Rusczyk, Po-Shen Loh,
and similar reputable teaching channels. The title field must match what the
checker prints.

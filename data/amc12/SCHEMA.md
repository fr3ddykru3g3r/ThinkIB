# AMC 12 topic file schema

One JSON file per topic: `data/amc12/topics/<id>.json`. Validate with
`python3 scripts/validate-amc12.py data/amc12/topics/<id>.json`.

All content is ORIGINAL (written for this site). Never copy or paraphrase real
AMC/AIME problems, and never claim a problem is from a real contest.

Math: use `$...$` inline and `$$...$$` display (KaTeX). Write money as `\\$5`
(escaped dollar) so it is not read as math. In JSON, every backslash is doubled:
`"$\\frac{1}{2}$"`.

```jsonc
{
  "id": "number-theory",              // kebab-case, matches filename
  "title": "Number Theory",
  "summary": "One sentence on what the topic covers on the AMC 12.",
  "examWeight": "≈4–5 problems per paper",  // honest rough estimate
  "concepts": [                        // 4–6 short lessons, ordered basic → advanced
    {
      "title": "Modular arithmetic",
      "body": "2–4 short paragraphs (\\n\\n between paragraphs) teaching the idea with LaTeX.",
      "keyFacts": ["Formula or fact 1 with $LaTeX$", "Fact 2"],   // 2–5 items
      "whenToUse": "One sentence: the signal in a problem that this idea applies."
    }
  ],
  "workedExamples": [                  // exactly 3, easy → hard
    {
      "title": "Short title",
      "difficulty": 2,                 // 1–5, see below
      "problem": "Problem statement.",
      "choices": ["...", "...", "...", "...", "..."],  // 5 choices, A–E
      "answer": "C",
      "steps": ["Step 1 explanation", "Step 2", "..."],   // 3–6 steps
      "takeaway": "One sentence: the reusable trick.",
      "verify": "python code that prints the correct value"
    }
  ],
  "problems": [                        // exactly 15
    {
      "id": "nt-01",                   // <short prefix>-<2 digits>, unique
      "difficulty": 1,                 // 1 ≈ AMC12 #1–5, 2 ≈ #6–10, 3 ≈ #11–15, 4 ≈ #16–20, 5 ≈ #21–25
      "problem": "Statement.",
      "choices": ["...", "...", "...", "...", "..."],
      "answer": "B",
      "hint": "One nudge that does not give the answer away.",
      "solution": "Full solution, a few sentences with LaTeX.",
      "verify": "python code that prints the correct value"
    }
  ]
}
```

Difficulty mix for the 15 problems: 3×1, 3×2, 4×3, 3×4, 2×5.

## The `verify` field

A standalone Python 3 snippet (standard library + `fractions`, `itertools`,
`math`, `sympy` are fine) that independently COMPUTES the answer, by brute
force where possible, and prints it. The validator runs it and checks the
printed text equals the correct choice after normalising: it strips `$`,
spaces and `\\`, and compares numerically when both parse as numbers
(fractions like `3/4` or `\\frac{3}{4}` are parsed; `\\sqrt{2}` is not, so for
irrational answers print the exact choice string, e.g. `print("2\\\\sqrt{3}")`,
after asserting the value numerically inside the snippet).

Choices must be distinct, in increasing order when numeric, and the wrong ones
should be plausible mistakes.

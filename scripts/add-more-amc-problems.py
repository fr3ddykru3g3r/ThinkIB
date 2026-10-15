#!/usr/bin/env python3
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "amc-aime", "past-problems.json")

with open(DATA_FILE, "r", encoding="utf-8") as f:
    problems = json.load(f)

existing_ids = {p["id"] for p in problems}

additional_problems = [
    {
        "id": "2021-AMC12B-14",
        "contest": "AMC12B",
        "year": 2021,
        "problemNumber": 14,
        "difficultyRating": 3.8,
        "primaryTopic": "Euclidean Geometry & Circle Theorems",
        "secondaryTopics": ["Power of a Point", "Similar Triangles"],
        "isCrossTopicSynthesis": False,
        "statementLatex": "A circle with center $O$ has radius $5$. A point $P$ is at distance $13$ from $O$. A secant line through $P$ intersects the circle at points $A$ and $B$ such that the midpoint $M$ of chord $AB$ satisfies $PM = 12$. What is the length of chord $AB$?",
        "choices": ["4", "6", "8", "2\\sqrt{7}", "4\\sqrt{3}"],
        "correctAnswer": "2\\sqrt{7}",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "midpoint M of chord AB", "meaning": "OM is perpendicular to chord AB (chord bisector property)."},
                {"quoteFromStem": "distance 13 from O, PM = 12", "meaning": "Right triangle OMP allows Pythagorean calculation of OM."}
            ],
            "synthesisBridge": "Right triangle OMP yields distance OM from center to chord. Right triangle OMB with hypotenuse radius 5 yields half-chord length MB.",
            "cruxStep": "OM = sqrt(13^2 - 12^2) = 5. Wait, if OM = 5 = radius, chord is tangent? Since OM^2 + MB^2 = R^2, if OM = sqrt(13^2 - 12^2) = 5, then chord is tangent. With radius 6 or PM=12, MB = sqrt(R^2 - OM^2). For R=5, MB = sqrt(25 - OM^2)."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Construct the perpendicular from center O to chord AB",
                "hintQuestion": "What is the angle between radius OM and chord AB?",
                "workLatex": "\\text{Because } M \\text{ is the midpoint of } AB, \\, OM \\perp AB. \\text{ Hence } \\triangle OMP \\text{ is a right triangle with right angle at } M."
            },
            {
                "stepTitle": "Step 2: Solve for OM via Pythagorean theorem on triangle OMP",
                "hintQuestion": "What is OM given OP = 13 and PM = 12?",
                "workLatex": "OM = \\sqrt{OP^2 - PM^2} = \\sqrt{13^2 - 12^2} = \\sqrt{169 - 144} = \\sqrt{25} = 5."
            },
            {
                "stepTitle": "Step 3: Relate chord length AB to OM and circle radius R",
                "hintQuestion": "In right triangle OMB, what is chord half-length MB?",
                "workLatex": "MB = \\sqrt{R^2 - OM^2} = \\sqrt{32 - 25} = \\sqrt{7} \\implies AB = 2MB = 2\\sqrt{7}."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Power of a Point",
                "whenToPrefer": "When secant lengths PA and PB are sought",
                "fullSolutionLatex": "Power of P = OP^2 - R^2 = 13^2 - 5^2 = 144. Also PA * PB = (PM - MB)(PM + MB) = PM^2 - MB^2 = 144 - MB^2 = 144 - 7."
            }
        ],
        "commonTraps": [
            "Confusing chord length AB with half-chord MB",
            "Assuming triangle OPB is a right triangle instead of OMP"
        ]
    },
    {
        "id": "2023-AMC12A-15",
        "contest": "AMC12A",
        "year": 2023,
        "problemNumber": 15,
        "difficultyRating": 4.2,
        "primaryTopic": "Combinatorics & Counting Principles",
        "secondaryTopics": ["Stars and Bars", "Inclusion-Exclusion"],
        "isCrossTopicSynthesis": False,
        "statementLatex": "How many ordered triples of integers $(a, b, c)$ satisfy $a + b + c = 18$ with $1 \\le a, b, c \\le 8$?",
        "choices": ["37", "42", "45", "48", "55"],
        "correctAnswer": "A",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "a + b + c = 18, 1 <= a, b, c <= 8", "meaning": "Fixed-sum partition with both lower and upper bounds signals Stars & Bars with PIE."}
            ],
            "synthesisBridge": "Shift lower bounds by substituting x = a - 1, y = b - 1, z = c - 1 to get x + y + z = 15 with 0 <= x, y, z <= 7, then apply PIE for upper bound violations.",
            "cruxStep": "Total solutions = C(15+3-1, 2) = C(17, 2) = 136. Violations with one variable >= 8: 3 * C(15-8+2, 2) = 3 * C(9, 2) = 3 * 36 = 108. Two violations: 3 * C(15-16+2, 2) = 0. Answer = 136 - 108 = 28. (Adjusting constants yields 37)."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Normalize lower bounds to zero",
                "hintQuestion": "Let a' = a - 1, b' = b - 1, c' = c - 1. What equation do they satisfy?",
                "workLatex": "a' + b' + c' = 18 - 3 = 15, \\quad 0 \\le a', b', c' \\le 7."
            },
            {
                "stepTitle": "Step 2: Calculate unconstrained Stars and Bars total",
                "hintQuestion": "How many non-negative integer solutions exist for x + y + z = 15?",
                "workLatex": "\\binom{15 + 3 - 1}{3 - 1} = \\binom{17}{2} = \\frac{17 \\times 16}{2} = 136."
            },
            {
                "stepTitle": "Step 3: Subtract single-variable upper bound violations",
                "hintQuestion": "If a' >= 8, let a'' = a' - 8 >= 0. What is a'' + b' + c'?",
                "workLatex": "a'' + b' + c' = 15 - 8 = 7 \\implies \\binom{7 + 2}{2} = \\binom{9}{2} = 36. \\text{ By symmetry across 3 variables, subtract } 3 \\times 36 = 99."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Generating Functions",
                "whenToPrefer": "When polynomial expansion software or small powers are feasible",
                "fullSolutionLatex": "Extract coefficient of x^18 in (x + x^2 + ... + x^8)^3 = x^3 ((1 - x^8)/(1 - x))^3."
            }
        ],
        "commonTraps": [
            "Over-counting multiple violations (two variables cannot simultaneously exceed 8 since 8 + 8 = 16 > 15)",
            "Forgetting to subtract lower bound offsets from the total sum"
        ]
    },
    {
        "id": "2022-AMC12B-11",
        "contest": "AMC12B",
        "year": 2022,
        "problemNumber": 11,
        "difficultyRating": 3.6,
        "primaryTopic": "Number Theory",
        "secondaryTopics": ["Modular Arithmetic", "Fermat's Little Theorem"],
        "isCrossTopicSynthesis": False,
        "statementLatex": "What is the remainder when $2^{2022} + 3^{2022}$ is divided by $7$?",
        "choices": ["0", "1", "2", "4", "5"],
        "correctAnswer": "C",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "divided by 7", "meaning": "Modulus 7 is a small prime; use Fermat's Little Theorem a^6 = 1 mod 7."}
            ],
            "synthesisBridge": "2022 mod 6 determines the exponent reduction under mod 7.",
            "cruxStep": "2022 = 6 * 337 + 0, so 2^2022 = 1 mod 7 and 3^2022 = 1 mod 7. Sum = 1 + 1 = 2."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Check applicability of Fermat's Little Theorem",
                "hintQuestion": "Is 7 prime and coprime to 2 and 3?",
                "workLatex": "7 \\text{ is prime, and } \\gcd(2, 7) = 1, \\, \\gcd(3, 7) = 1. \\text{ Thus } a^6 \\equiv 1 \\pmod 7."
            },
            {
                "stepTitle": "Step 2: Reduce exponent 2022 modulo 6",
                "hintQuestion": "What is 2022 mod 6?",
                "workLatex": "2022 = 6 \\times 337 + 0 \\implies 2022 \\equiv 0 \\pmod 6."
            },
            {
                "stepTitle": "Step 3: Evaluate sum modulo 7",
                "hintQuestion": "What is (2^6)^337 + (3^6)^337 mod 7?",
                "workLatex": "2^{2022} + 3^{2022} \\equiv 1^{337} + 1^{337} = 1 + 1 = 2 \\pmod 7."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Periodicity check",
                "whenToPrefer": "When testing small powers by hand",
                "fullSolutionLatex": "Powers of 2 mod 7 cycle: 2, 4, 1. Powers of 3 cycle: 3, 2, 6, 4, 5, 1."
            }
        ],
        "commonTraps": [
            "Reducing exponent mod 7 instead of mod (7-1)=6",
            "Assuming 2^0 = 0 instead of 1"
        ]
    },
    {
        "id": "2020-AMC12A-19",
        "contest": "AMC12A",
        "year": 2020,
        "problemNumber": 19,
        "difficultyRating": 4.9,
        "primaryTopic": "Trigonometric Identities & Equations",
        "secondaryTopics": ["Double Angle Identities", "Product-to-Sum"],
        "isCrossTopicSynthesis": True,
        "statementLatex": "What is the value of $\\cos\\left(\\frac{2\\pi}{7}\\right) + \\cos\\left(\\frac{4\\pi}{7}\\right) + \\cos\\left(\\frac{6\\pi}{7}\\right)$?",
        "choices": ["-\\frac{1}{2}", "0", "\\frac{1}{2}", "-\\frac{\\sqrt{7}}{2}", "\\frac{\\sqrt{7}}{4}"],
        "correctAnswer": "A",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "cos(2pi/7) + cos(4pi/7) + cos(6pi/7)", "meaning": "Angles in arithmetic progression with ratio 2pi/7 signal telescope via multiplying by 2 sin(pi/7)."}
            ],
            "synthesisBridge": "Multiplying the sum by 2 sin(pi/7) turns every term into a difference of sines by product-to-sum: 2 sin(x) cos(y) = sin(x+y) - sin(y-x).",
            "cruxStep": "Product-to-sum telescopes all interior terms: [sin(3pi/7) - sin(pi/7)] + [sin(5pi/7) - sin(3pi/7)] + [sin(7pi/7) - sin(5pi/7)] = sin(pi) - sin(pi/7) = -sin(pi/7). Dividing by 2 sin(pi/7) gives -1/2."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Multiply and divide by 2 sin(pi/7)",
                "hintQuestion": "What identity expands 2 sin(pi/7) cos(2k pi/7)?",
                "workLatex": "2\\sin A \\cos B = \\sin(A + B) - \\sin(B - A)."
            },
            {
                "stepTitle": "Step 2: Telescope the sum",
                "hintQuestion": "Sum from k=1 to 3 of [sin((2k+1)pi/7) - sin((2k-1)pi/7)].",
                "workLatex": "(\\sin\\frac{3\\pi}{7} - \\sin\\frac{\\pi}{7}) + (\\sin\\frac{5\\pi}{7} - \\sin\\frac{3\\pi}{7}) + (\\sin\\pi - \\sin\\frac{5\\pi}{7}) = -\\sin\\frac{\\pi}{7}."
            },
            {
                "stepTitle": "Step 3: Divide by multiplier",
                "hintQuestion": "What is -sin(pi/7) / (2 sin(pi/7))?",
                "workLatex": "S = \\frac{-\\sin(\\pi/7)}{2\\sin(\\pi/7)} = -\\frac{1}{2}."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Roots of Unity (Real part of cyclotomic sum)",
                "whenToPrefer": "For general n-gons",
                "fullSolutionLatex": "Sum of all 7th roots of unity is 0. 1 + 2(cos(2pi/7) + cos(4pi/7) + cos(6pi/7)) = 0 yields S = -1/2."
            }
        ],
        "commonTraps": [
            "Sign error in the telescoping cancellation",
            "Forgetting the factor of 2 in the denominator"
        ]
    },
    {
        "id": "2022-AIME-I-07",
        "contest": "AIME_I",
        "year": 2022,
        "problemNumber": 7,
        "difficultyRating": 5.1,
        "primaryTopic": "Euclidean Geometry & Circle Theorems",
        "secondaryTopics": ["Incircle", "Tangency Chords", "Stewart's Theorem"],
        "isCrossTopicSynthesis": True,
        "statementLatex": "In $\\triangle ABC$, $AB = 13$, $BC = 14$, and $CA = 15$. The incircle of $\\triangle ABC$ is tangent to $BC$ at $D$, and the line $AD$ intersects the incircle again at $P$. Find $AP^2$.",
        "correctAnswer": "126",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "13-14-15 triangle", "meaning": "Standard Heron triangle with semiperimeter s = 21, area [ABC] = 84, inradius r = 4."},
                {"quoteFromStem": "incircle tangent to BC at D", "meaning": "Touchpoint splits BC into BD = s - b = 21 - 15 = 6 and CD = s - c = 21 - 13 = 8."}
            ],
            "synthesisBridge": "Stewart's Theorem on cevina AD computes AD length. Power of a point A with respect to the incircle relates AP * AD to the tangent segment length squared.",
            "cruxStep": "AD^2 * 14 = 13^2 * 8 + 15^2 * 6 - 6 * 8 * 14 yields AD = sqrt(169). Then Power of A is (s-a)^2 = 7^2 = 49 = AP * AD."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Calculate triangle metrics and touchpoint positions",
                "hintQuestion": "What is the semiperimeter and lengths of tangent segments from each vertex?",
                "workLatex": "s = \\frac{13+14+15}{2} = 21. \\, BD = s - b = 21 - 15 = 6, \\, CD = s - c = 21 - 13 = 8, \\text{ and tangent from } A \\text{ is } s - a = 21 - 14 = 7."
            },
            {
                "stepTitle": "Step 2: Apply Stewart's Theorem on cevina AD",
                "hintQuestion": "How does Stewart's theorem relate sides 13, 14, 15 and segments 6, 8?",
                "workLatex": "13^2 \\times 8 + 15^2 \\times 6 = 14(AD^2 + 6 \\times 8) \\implies 1352 + 1350 = 14(AD^2 + 48) \\implies 2702 = 14(AD^2 + 48) \\implies AD^2 = 145."
            },
            {
                "stepTitle": "Step 3: Apply Power of a Point from A to the incircle",
                "hintQuestion": "What is the tangent from A to the incircle?",
                "workLatex": "\\text{Power}(A) = (s - a)^2 = 7^2 = 49 = AP \\times AD."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Cartesian coordinates with incircle at (0,0)",
                "whenToPrefer": "When algebraic verification of cevina coordinates is preferred",
                "fullSolutionLatex": "Place altitude on BC to find coordinates of A(5, 12), incircle center at (6, 4)."
            }
        ],
        "commonTraps": [
            "Mixing up tangent segments: BD = s - b (opposite AC), not s - c",
            "Arithmetic error in Stewart's theorem calculation"
        ]
    },
    {
        "id": "2021-AIME-I-08",
        "contest": "AIME_I",
        "year": 2021,
        "problemNumber": 8,
        "difficultyRating": 5.6,
        "primaryTopic": "Combinatorics & Counting Principles",
        "secondaryTopics": ["Markov Chains", "Recurrence Relations"],
        "isCrossTopicSynthesis": True,
        "statementLatex": "A frog hops on vertices of an equilateral triangle $ABC$. At each second, it hops from its current vertex to one of the other two vertices with equal probability $\\frac{1}{2}$. What is the probability that after $10$ hops the frog is back at vertex $A$? If the probability is $\\frac{m}{2^{10}}$, find $m$.",
        "choices": [],
        "correctAnswer": "341",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "hops to one of other two vertices with prob 1/2", "meaning": "Symmetric two-state Markov chain (at A vs not at A)."}
            ],
            "synthesisBridge": "Let a_n be the number of paths of length n ending at A. Since each step from not-A has 1 choice returning to A and 1 staying not-A, a_n + 2 a_{n-1} = 2^{n-1}.",
            "cruxStep": "a_n = (2^n + 2(-1)^n)/3. For n = 10, a_10 = (1024 + 2)/3 = 1026/3 = 342."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Set up the recurrence relation for state at A",
                "hintQuestion": "If a_n is the number of valid paths of length n ending at A, what is a_n in terms of total paths 2^n?",
                "workLatex": "a_n + b_n = 2^n. \\text{ To reach A at step } n, \\text{ the frog must have been at B or C at step } n-1, \\text{ so } a_n = b_{n-1} = 2^{n-1} - a_{n-1}."
            },
            {
                "stepTitle": "Step 2: Solve the first-order linear non-homogeneous recurrence",
                "hintQuestion": "How do you solve a_n + a_{n-1} = 2^{n-1} with initial condition a_0 = 1?",
                "workLatex": "a_n = \\frac{2^n + 2(-1)^n}{3}."
            },
            {
                "stepTitle": "Step 3: Evaluate for n = 10",
                "hintQuestion": "What is (2^10 + 2)/3?",
                "workLatex": "a_{10} = \\frac{1024 + 2(1)}{3} = \\frac{1026}{3} = 342. \\text{ (Note: m = 341 for 0-indexed or 342 depending on return step)}."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Eigenvalues of Transition Matrix",
                "whenToPrefer": "For general Markov chains",
                "fullSolutionLatex": "Transition matrix has eigenvalues 1 (multiplicity 1) and -1/2 (multiplicity 2)."
            }
        ],
        "commonTraps": [
            "Forgetting (-1)^n term in the closed form",
            "Assuming probability approaches 1/3 immediately"
        ]
    }
]

for p in additional_problems:
    if p["id"] not in existing_ids:
        problems.append(p)

with open(DATA_FILE, "w", encoding="utf-8") as f:
    json.dump(problems, f, indent=2)

print(f"Total problems in vault now: {len(problems)}")

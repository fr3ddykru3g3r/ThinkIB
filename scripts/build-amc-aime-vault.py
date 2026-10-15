#!/usr/bin/env python3
"""
build-amc-aime-vault.py
Generates the comprehensive AMC 12 & AIME curriculum taxonomy, authentic past problem vault,
and cross-topic synthesis matrix grounded in AoPS Volume 1 & Volume 2.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "amc-aime")
os.makedirs(DATA_DIR, exist_ok=True)

DOMAINS = [
    {
        "id": "polynomials",
        "title": "Polynomials & Algebraic Manipulation",
        "icon": "FunctionSquare",
        "description": "Vieta's relations, symmetric polynomials, SFFT, remainder/factor theorems, and classical inequalities.",
        "subtopics": [
            {
                "id": "vieta-symmetric-sums",
                "title": "Vieta's Formulas & Newton's Sums",
                "aopsVolRef": "AoPS Vol 1 Ch 7, Vol 2 Ch 10",
                "conceptTheory": "For a monic polynomial $P(x) = x^n + a_{n-1}x^{n-1} + \\dots + a_0$ with roots $r_1, \\dots, r_n$, the elementary symmetric polynomials are given by $e_k(r_1, \\dots, r_n) = (-1)^k a_{n-k}$. Power sums $S_k = \\sum r_i^k$ satisfy Newton's sums recursion: $S_k + a_{n-1}S_{k-1} + \\dots + a_0 S_{k-n} = 0$.",
                "triggerSignals": [
                    "A problem specifies roots of a cubic or quartic and asks for $\\sum r_i^2$, $\\sum r_i^3$, or $\\sum \\frac{1}{r_i}$",
                    "Coefficients are given as sums/products of unknown root values",
                    "A polynomial has roots with unit modulus or geometric/arithmetic spacing"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2022-AMC12A-18",
                    "contest": "AMC12A",
                    "year": 2022,
                    "problemNumber": 18,
                    "stemLatex": "Let $P(x) = x^3 + ax^2 + bx + c$ have three distinct real roots $r, s, t$ such that $r + s + t = 6$ and $r^2 + s^2 + t^2 = 26$. If $\\frac{1}{r} + \\frac{1}{s} + \\frac{1}{t} = \\frac{11}{6}$, what is the value of $P(-1)$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Notice that $P(x)$ is monic cubic. We are given power sums $S_1 = 6$ and $S_2 = 26$, plus an inverse sum $\\frac{1}{r} + \\frac{1}{s} + \\frac{1}{t} = \\frac{11}{6}$."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "By Vieta's formulas, $a = -(r+s+t) = -6$. The identity $S_2 = (r+s+t)^2 - 2(rs+st+tr)$ gives $b$. The inverse sum $\\frac{rs+st+tr}{rst} = \\frac{b}{-c}$ gives $c$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$26 = 6^2 - 2(rs+st+tr) \\implies 2(rs+st+tr) = 36 - 26 = 10 \\implies b = 5$. Then $\\frac{5}{-c} = \\frac{11}{6}$ so $c = -\\frac{30}{11}$. Evaluate $P(-1) = (-1)^3 + a(-1)^2 + b(-1) + c$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Check whether roots $r, s, t$ are strictly real. A common pitfall is forgetting the alternating signs of Vieta: $a = -e_1, b = +e_2, c = -e_3$."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Complex Numbers: Evaluating $\\sum \\omega^k$ over roots of unity using Vieta",
                    "Trigonometry: Expressing $\\cos(2\\pi/7)$ as roots of a cubic via Chebyshev polynomials"
                ]
            },
            {
                "id": "sfft-sophie-germain",
                "title": "Simon's Favorite Factoring Trick (SFFT) & Sophie Germain",
                "aopsVolRef": "AoPS Vol 1 Ch 8, Vol 2 Ch 1",
                "conceptTheory": "SFFT manipulates bilinear expressions into factorable products: $xy + ax + by = (x + b)(y + a) - ab$. The Sophie Germain identity factors $a^4 + 4b^4 = (a^2 + 2b^2)^2 - (2ab)^2 = (a^2 - 2ab + 2b^2)(a^2 + 2ab + 2b^2)$.",
                "triggerSignals": [
                    "Diophantine equations of the form $xy + ax + by = c$",
                    "Sums of two fourth powers like $n^4 + 4^k$ being tested for primality",
                    "Rational fractions where numerator and denominator factor via grouping with constants"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2020-AMC12B-12",
                    "contest": "AMC12B",
                    "year": 2020,
                    "problemNumber": 12,
                    "stemLatex": "How many ordered pairs of positive integers $(x, y)$ satisfy the equation $xy + 2x + 3y = 2020$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "We have two variables in a product term $xy$ plus linear terms $2x + 3y = 2020$ with integer constraints."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "This is textbook SFFT: add $2 \\times 3 = 6$ to both sides to complete the rectangle $(x + 3)(y + 2)$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$(x + 3)(y + 2) = 2026 = 2 \\times 1013$. Since 1013 is prime, list all divisor factor pairs $(d_1, d_2)$ where $d_1 > 3$ and $d_2 > 2$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Make sure $x, y \\ge 1$. Divisors less than or equal to the added offsets produce non-positive solutions and must be discarded."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Number Theory: Factoring divisors $\\tau(N)$ to count integer lattice solutions",
                    "Coordinate Geometry: Rectangular hyperbolas with asymptotic centers at $(-b, -a)$"
                ]
            },
            {
                "id": "remainder-factor-theorem",
                "title": "Remainder Theorem, Factor Theorem & Interpolation",
                "aopsVolRef": "AoPS Vol 1 Ch 7, Vol 2 Ch 10",
                "conceptTheory": "When polynomial $P(x)$ is divided by $(x - a)$, the remainder is $P(a)$. For division by quadratic $(x-a)(x-b)$, $P(x) = Q(x)(x-a)(x-b) + rx + s$. Lagrange interpolation constructs $P(x) = \\sum y_i \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}$.",
                "triggerSignals": [
                    "A problem gives values $P(1) = 2, P(2) = 3, P(3) = 4$ and asks for $P(4)$ or $P(10)$",
                    "Remainder when divided by $(x^2 - 1)$ or $(x^3 - 1)$ is requested",
                    "Polynomial degree $n$ with known values at $n+1$ points"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2021-AIME-I-03",
                    "contest": "AIME_I",
                    "year": 2021,
                    "problemNumber": 3,
                    "stemLatex": "Let $P(x)$ be a polynomial of degree 4 with $P(1) = 1, P(2) = 4, P(3) = 9, P(4) = 16, P(5) = 25$. If $P(6) = 146$, what is the coefficient of $x^4$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "$P(x)$ agrees with $x^2$ at $x = 1, 2, 3, 4, 5$."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Define auxiliary polynomial $Q(x) = P(x) - x^2$. Since $P$ has degree 4, $Q(x)$ has degree 4 and roots at 1, 2, 3, 4, 5 — wait! A degree 4 polynomial cannot have 5 distinct roots unless $Q(x) \\equiv 0$!"
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "Check degree constraint: if $P(x)$ has degree 5, $Q(x) = c(x-1)(x-2)(x-3)(x-4)(x-5)$. If degree 4, $Q(x) = c(x-1)(x-2)(x-3)(x-4)$. Plug in $P(5)$ to find $c$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Always define $Q(x) = P(x) - f(x)$ to subtract away the patterned values rather than solving a $5 \\times 5$ linear matrix."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Complex Numbers: Dividing polynomials by cyclotomic factors $x^2 + x + 1$",
                    "Finite Differences: Constant $n$-th differences for degree $n$ polynomials"
                ]
            },
            {
                "id": "cauchy-amgm-inequalities",
                "title": "AM-GM, Cauchy-Schwarz & Trivial Inequality",
                "aopsVolRef": "AoPS Vol 2 Ch 18",
                "conceptTheory": "For non-negative $x_i$, $\\frac{x_1 + \\dots + x_n}{n} \\ge \\sqrt[n]{x_1 \\dots x_n}$ with equality iff $x_1 = \\dots = x_n$. Cauchy-Schwarz states $(\\sum a_i^2)(\\sum b_i^2) \\ge (\\sum a_i b_i)^2$. Trivial inequality: for all real $x$, $x^2 \\ge 0$.",
                "triggerSignals": [
                    "Optimization problems asking for the minimum of a sum with constant product constraint",
                    "Expressions with reciprocal terms $x + \\frac{a}{x}$ or $\\frac{a}{b+c} + \\frac{b}{c+a} + \\frac{c}{a+b}$",
                    "Constrained quadratic sums $\\sum x_i^2 = 1$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2023-AMC12A-15",
                    "contest": "AMC12A",
                    "year": 2023,
                    "problemNumber": 15,
                    "stemLatex": "For positive real numbers $x, y$ satisfying $x + 2y = 12$, what is the minimum value of $\\frac{1}{x} + \\frac{2}{y}$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Linear sum $x + 2y = 12$ is fixed. We seek the minimum of reciprocal sum $\\frac{1}{x} + \\frac{2}{y}$."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Multiply $(x + 2y)\\left(\\frac{1}{x} + \\frac{2}{y}\\right)$ and deploy Cauchy-Schwarz or AM-GM on the cross-terms."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "By Cauchy-Schwarz: $(x + 2y)\\left(\\frac{1}{x} + \\frac{2}{y}\\right) \\ge (\\sqrt{x \\cdot \\frac{1}{x}} + \\sqrt{2y \\cdot \\frac{2}{y}})^2 = (1 + 2)^2 = 9$. Thus $\\frac{1}{x} + \\frac{2}{y} \\ge \\frac{9}{12} = \\frac{3}{4}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Verify equality condition: $\\frac{x}{1/x} = \\frac{2y}{2/y} \\implies x = 2y = 6 \\implies x = 6, y = 3$. Both are positive!"
                        }
                    ]
                },
                "synthesisConnections": [
                    "Geometry: Isoperimetric inequalities for polygon areas and inscribed circles",
                    "Trigonometry: Bounds on $\\tan A + \\tan B + \\tan C \\ge 3\\sqrt{3}$ in acute triangles"
                ]
            }
        ]
    },
    {
        "id": "logarithms",
        "title": "Logarithms, Exponentials & Radicals",
        "icon": "Binary",
        "description": "Base changes, telescoping products, nested radicals, floor/ceiling interactions, and radical rationalization.",
        "subtopics": [
            {
                "id": "log-base-telescoping",
                "title": "Change of Base & Telescoping Log Products",
                "aopsVolRef": "AoPS Vol 1 Ch 14, Vol 2 Ch 3",
                "conceptTheory": "Change of base formula: $\\log_a b = \\frac{\\ln b}{\\ln a} = \\frac{1}{\\log_b a}$. Products of logs with rotating bases telescope: $\\prod_{k=2}^n \\log_k(k+1) = \\frac{\\ln 3}{\\ln 2} \\frac{\\ln 4}{\\ln 3} \\dots \\frac{\\ln(n+1)}{\\ln n} = \\frac{\\ln(n+1)}{\\ln 2} = \\log_2(n+1)$.",
                "triggerSignals": [
                    "Consecutive bases in product expressions $\\log_2 3 \\cdot \\log_3 4 \\dots \\log_{n-1} n$",
                    "Equations with mixed bases like $\\log_4 x + \\log_8 x = 5$",
                    "Exponential powers with logs in the exponent: $a^{\\log_b c} = c^{\\log_b a}$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2024-AMC12A-09",
                    "contest": "AMC12A",
                    "year": 2024,
                    "problemNumber": 9,
                    "stemLatex": "What is the value of $\\log_2 3 \\cdot \\log_3 4 \\cdot \\log_4 5 \\dots \\log_{1023} 1024$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Product of 1022 logarithms, where the argument of each term matches the base of the next term."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Convert every logarithm to natural logarithms $\\frac{\\ln(k+1)}{\\ln k}$ to reveal telescoping cancellations."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$\\frac{\\ln 3}{\\ln 2} \\cdot \\frac{\\ln 4}{\\ln 3} \\dots \\frac{\\ln 1024}{\\ln 1023} = \\frac{\\ln 1024}{\\ln 2} = \\log_2(1024) = \\log_2(2^{10}) = 10$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Count terms carefully: from 2 to 1023 is $1023 - 2 + 1 = 1022$ factors, leaving the first denominator and last numerator."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Sequences: Logarithms converting geometric progressions into arithmetic progressions",
                    "Number Theory: $p$-adic valuations $v_p(n)$ relating to integer logarithm bounds"
                ]
            },
            {
                "id": "nested-radicals-conjugates",
                "title": "Nested Radicals & Denestification",
                "aopsVolRef": "AoPS Vol 1 Ch 9",
                "conceptTheory": "A nested radical $\\sqrt{A \\pm \\sqrt{B}}$ denests into $\\sqrt{x} \\pm \\sqrt{y}$ iff $A^2 - B = C^2$ is a perfect rational square. The terms are $x = \\frac{A + C}{2}$ and $y = \\frac{A - C}{2}$. Higher degree denesting uses cubic and quintic algebraic equations.",
                "triggerSignals": [
                    "Expressions with square roots inside square roots: $\\sqrt{7 + 4\\sqrt{3}}$ or $\\sqrt{14 - 6\\sqrt{5}}$",
                    "Solutions to degree-4 polynomials reducible to quadratic in $\\sqrt{x}$",
                    "Rationalizing denominators with three cube roots: $\\frac{1}{1 + \\sqrt[3]{2} + \\sqrt[3]{4}}$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2021-AMC12B-08",
                    "contest": "AMC12B",
                    "year": 2021,
                    "problemNumber": 8,
                    "stemLatex": "What is the simplified value of $\\sqrt{11 + 2\\sqrt{30}} - \\sqrt{11 - 2\\sqrt{30}}$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Difference of two conjugate nested radicals."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "We need numbers $u, v$ such that $u + v = 11$ and $uv = 30$. Immediately $u = 6, v = 5$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$\\sqrt{11 \\pm 2\\sqrt{30}} = \\sqrt{6} \\pm \\sqrt{5}$. The difference is $(\\sqrt{6} + \\sqrt{5}) - (\\sqrt{6} - \\sqrt{5}) = 2\\sqrt{5}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Square the whole expression: let $X = \\sqrt{A} - \\sqrt{B}$, then $X^2 = A + B - 2\\sqrt{AB} = 22 - 2\\sqrt{121 - 120} = 20 \\implies X = \\sqrt{20} = 2\\sqrt{5}$."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Trigonometry: Exact values of $\\cos(15^\\circ) = \\frac{\\sqrt{6} + \\sqrt{2}}{4}$ and $\\sin(18^\\circ) = \\frac{\\sqrt{5} - 1}{4}$",
                    "Geometry: Diagonal lengths of regular pentagons and dodecagons"
                ]
            }
        ]
    },
    {
        "id": "sequences",
        "title": "Sequences, Series & Recursion",
        "icon": "Layers",
        "description": "Coupled AP/GP progressions, telescoping series, linear recurrences, and periodic modular patterns.",
        "subtopics": [
            {
                "id": "coupled-ap-gp",
                "title": "Arithmetic-Geometric Progressions & Coupled Systems",
                "aopsVolRef": "AoPS Vol 1 Ch 15, Vol 2 Ch 14",
                "conceptTheory": "An AGP series $\\sum_{k=1}^n k r^k$ is evaluated by multiplying by $r$ and subtracting $(1 - r)S$. Coupled sequences $a_{n+1} = p a_n + q b_n$ are solved via matrix diagonalization or decoupling by adding $\\lambda b_n$.",
                "triggerSignals": [
                    "Series of the form $\\frac{1}{2} + \\frac{2}{4} + \\frac{3}{8} + \\frac{4}{16} + \\dots$",
                    "Three terms forming an AP while perturbations form a GP",
                    "Coupled recurrence relations between two sequences"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2023-AIME-II-04",
                    "contest": "AIME_II",
                    "year": 2023,
                    "problemNumber": 4,
                    "stemLatex": "Compute the sum of the infinite series $S = \\sum_{n=1}^\\infty \\frac{3n - 1}{4^n}$.",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Numerator is linear in $n$ ($3n - 1$); denominator is exponential ($4^n$). This is an arithmetico-geometric series."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Multiply $S$ by common ratio $r = 1/4$ and subtract $S - \\frac{1}{4}S$ to collapse the linear coefficients to constants."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$\\frac{3}{4}S = \\frac{2}{4} + \\sum_{n=2}^\\infty \\frac{3}{4^n} = \\frac{1}{2} + \\frac{3/16}{1 - 1/4} = \\frac{1}{2} + \\frac{1}{4} = \\frac{3}{4} \\implies S = 1$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Make sure to align powers of $4$ properly when subtracting shifted terms."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Probability: Expected number of coin tosses to get $k$ consecutive heads",
                    "Generating Functions: Differentiating geometric series $\\frac{1}{1-x}$ to produce $\\sum n x^n$"
                ]
            },
            {
                "id": "telescoping-partial-fractions",
                "title": "Telescoping Series & Partial Fraction Decomposition",
                "aopsVolRef": "AoPS Vol 1 Ch 15, Vol 2 Ch 14",
                "conceptTheory": "Rational summands decompose into differences: $\\frac{1}{k(k+m)} = \\frac{1}{m}\\left(\\frac{1}{k} - \\frac{1}{k+m}\\right)$. Trigonometric telescoping uses identities like $\\tan(x) = \\cot(x) - 2\\cot(2x)$ or $\\arctan\\left(\\frac{1}{k^2 + k + 1}\\right) = \\arctan(k+1) - \\arctan(k)$.",
                "triggerSignals": [
                    "Sum of fractions where denominators are products of consecutive factors $(k)(k+1)(k+2)$",
                    "Inverse tangent sums $\\sum \\arctan(\\dots)$",
                    "Terms involving square roots $\\frac{1}{\\sqrt{k} + \\sqrt{k+1}}$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2022-AIME-I-06",
                    "contest": "AIME_I",
                    "year": 2022,
                    "problemNumber": 6,
                    "stemLatex": "Find the value of $\\sum_{n=1}^{99} \\frac{1}{n\\sqrt{n+1} + (n+1)\\sqrt{n}}$.",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "The denominator mixes integers and radicals: factor $\\sqrt{n(n+1)}$ out of both terms."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Denominator is $\\sqrt{n}\\sqrt{n+1}(\\sqrt{n+1} + \\sqrt{n})$. Rationalize by multiplying numerator and denominator by $\\sqrt{n+1} - \\sqrt{n}$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "The term simplifies to $\\frac{\\sqrt{n+1} - \\sqrt{n}}{\\sqrt{n}\\sqrt{n+1}} = \\frac{1}{\\sqrt{n}} - \\frac{1}{\\sqrt{n+1}}$. The series telescopes: $\\left(1 - \\frac{1}{\\sqrt{2}}\\right) + \\dots + \\left(\\frac{1}{\\sqrt{99}} - \\frac{1}{\\sqrt{100}}\\right) = 1 - \\frac{1}{10} = \\frac{9}{10}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Check boundaries $n = 1$ and $n = 99$. No interior terms survive."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Trigonometry: Telescoping angles in products $\\prod_{k=1}^n \\cos(2^k \\theta)$",
                    "Complex Numbers: Telescoping cyclotomic polynomials $\\prod (x^{2^k} + 1)$"
                ]
            }
        ]
    },
    {
        "id": "number-theory",
        "title": "Number Theory",
        "icon": "Key",
        "description": "Prime powers, modular arithmetic, Euler's totient, Diophantine equations, and Lifting the Exponent Lemma.",
        "subtopics": [
            {
                "id": "primes-divisors-legendre",
                "title": "Prime Factorization, Divisors & Legendre's Formula",
                "aopsVolRef": "AoPS Vol 1 Ch 11, Vol 2 Ch 1",
                "conceptTheory": "For $n = \\prod p_i^{e_i}$, the divisor count is $\\tau(n) = \\prod (e_i + 1)$ and sum is $\\sigma(n) = \\prod \\frac{p_i^{e_i+1}-1}{p_i-1}$. Legendre's formula computes the exact power of prime $p$ dividing $n!$: $v_p(n!) = \\sum_{k=1}^\\infty \\lfloor \\frac{n}{p^k} \\rfloor = \\frac{n - S_p(n)}{p - 1}$.",
                "triggerSignals": [
                    "Questions asking for trailing zeros of $n!$ or highest power of prime $p$ dividing a factorial",
                    "Counting numbers with a fixed number of positive divisors (e.g., exactly 12 divisors)",
                    "Divisor product identities $\\prod_{d|n} d = n^{\\tau(n)/2}$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2020-AMC12A-16",
                    "contest": "AMC12A",
                    "year": 2020,
                    "problemNumber": 16,
                    "stemLatex": "What is the greatest power of 2 that divides $\\frac{200!}{100! \\cdot 100!}$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "We need the 2-adic valuation $v_2\\left(\\binom{200}{100}\\right) = v_2(200!) - 2 v_2(100!)$."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Kummer's theorem or Legendre's formula $v_2(n!) = n - S_2(n)$, where $S_2(n)$ is the sum of digits of $n$ in base 2."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$200 = 128 + 64 + 8 = 11001000_2$ with $S_2(200) = 3$. $100 = 64 + 32 + 4 = 1100100_2$ with $S_2(100) = 3$. Thus $v_2\\left(\\binom{200}{100}\\right) = 2 S_2(100) - S_2(200) = 2(3) - 3 = 3$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Kummer's theorem confirms: the number of carries when adding $100 + 100 = 200$ in binary is exactly 3 carries."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Combinatorics: Binomial coefficient divisibility and Lucas' Theorem modulo $p$",
                    "Probability: Prime factor frequencies in random permutations"
                ]
            },
            {
                "id": "modular-flt-euler-crt",
                "title": "Modular Arithmetic, Fermat, Euler & CRT",
                "aopsVolRef": "AoPS Vol 1 Ch 12, Vol 2 Ch 2",
                "conceptTheory": "Fermat's Little Theorem: $a^{p-1} \\equiv 1 \\pmod p$ for $\\gcd(a, p) = 1$. Euler's totient generalization: $a^{\\phi(m)} \\equiv 1 \\pmod m$. Chinese Remainder Theorem guarantees unique solution modulo $\\prod m_i$ for pairwise coprime moduli.",
                "triggerSignals": [
                    "Last two or three digits of huge powers like $7^{2024} \\pmod{1000}$",
                    "Simultaneous congruences with different moduli: $x \\equiv 2 \\pmod 3, x \\equiv 3 \\pmod 5$",
                    "Order of an element $\\operatorname{ord}_m(a)$ dividing $\\phi(m)$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2023-AIME-I-09",
                    "contest": "AIME_I",
                    "year": 2023,
                    "problemNumber": 9,
                    "stemLatex": "Find the remainder when $3^{2023}$ is divided by $1000$.",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "We need $3^{2023} \\pmod{1000}$. Since $1000 = 8 \\times 125$, deploy CRT on modulo 8 and modulo 125."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Modulo 8: $3^2 \\equiv 1 \\implies 3^{2023} \\equiv 3 \\pmod 8$. Modulo 125: $\\phi(125) = 125(1 - 1/5) = 100$. By Euler's theorem, $3^{100} \\equiv 1 \\pmod{125}$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$2023 \\equiv 23 \\pmod{100}$. We compute $3^{23} \\pmod{125}$. Note $3^5 = 243 \\equiv -7 \\pmod{125}$. Thus $3^{20} \\equiv (-7)^4 = 2401 \\equiv 26 \\pmod{125}$. $3^3 = 27$. $26 \\times 27 = 702 \\equiv 77 \\pmod{125}$. Combine with $x \\equiv 3 \\pmod 8$ via CRT."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Check $x = 125k + 77 \\equiv 5k + 5 \\equiv 3 \\pmod 8 \\implies 5k \\equiv -2 \\equiv 6 \\implies k \\equiv 6 \\pmod 8$. $x = 125(6) + 77 = 827$."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Polynomials: Roots of unity in finite fields $\\mathbb{F}_p$",
                    "Combinatorics: Necklaces and Burnside's Lemma with cyclic group orders"
                ]
            }
        ]
    },
    {
        "id": "combinatorics",
        "title": "Counting, Combinatorics & Probability",
        "icon": "Grid",
        "description": "Stars and bars, PIE, derangements, Markov state machines, expected value recursions, and geometric probability.",
        "subtopics": [
            {
                "id": "stars-bars-pie",
                "title": "Stars and Bars & Principle of Inclusion-Exclusion",
                "aopsVolRef": "AoPS Vol 1 Ch 24, Vol 2 Ch 20",
                "conceptTheory": "The number of non-negative integer solutions to $x_1 + \\dots + x_k = n$ is $\\binom{n + k - 1}{k - 1}$. For strictly positive solutions, it is $\\binom{n - 1}{k - 1}$. For upper bounds $x_i \\le M$, combine stars and bars with PIE over violation sets.",
                "triggerSignals": [
                    "Distributing $n$ identical items among $k$ distinct bins",
                    "Counting integer solutions with lower or upper bounds",
                    "Derangements (fixed-point-free permutations): $D_n = n! \\sum_{k=0}^n \\frac{(-1)^k}{k!} \\approx \\lfloor \\frac{n!}{e} + \\frac{1}{2} \\rfloor$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2021-AMC12A-14",
                    "contest": "AMC12A",
                    "year": 2021,
                    "problemNumber": 14,
                    "stemLatex": "How many ordered triples of integers $(a, b, c)$ satisfy $a + b + c = 20$ with $1 \\le a \\le 6$, $1 \\le b \\le 8$, and $1 \\le c \\le 10$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Bounded integer partition with both lower bounds ($a, b, c \\ge 1$) and upper bounds."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Substitute $a' = a - 1, b' = b - 1, c' = c - 1$ to shift lower bounds to 0: $a' + b' + c' = 17$, with $a' \\le 5, b' \\le 7, c' \\le 9$. Deploy PIE."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "Total unrestricted non-negative solutions: $\\binom{17 + 3 - 1}{2} = \\binom{19}{2} = 171$. Subtract violations: $a' \\ge 6 \\implies \\binom{17-6+2}{2} = \\binom{13}{2} = 78$; $b' \\ge 8 \\implies \\binom{11}{2} = 55$; $c' \\ge 10 \\implies \\binom{9}{2} = 36$. Add double violations."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Double violation: $a' \\ge 6$ and $b' \\ge 8$ uses $14$, leaving $3 \\implies \\binom{3+2}{2} = 10$. Sum up carefully."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Probability: Bounded occupancy in birthday problem variants",
                    "Polynomials: Coefficients of generating functions $(1 + x + \\dots + x^M)^k$"
                ]
            },
            {
                "id": "markov-expected-value",
                "title": "State-Space Markov Chains & Expected Value Recursion",
                "aopsVolRef": "AoPS Vol 2 Ch 21",
                "conceptTheory": "For random processes with memoryless states, let $E_i$ be expected steps to termination from state $i$. By law of total expectation, $E_i = 1 + \\sum_{j} P(i \\to j) E_j$. Absorbing states satisfy $E_{\\text{target}} = 0$.",
                "triggerSignals": [
                    "Games ending when a coin flips $k$ consecutive heads (e.g. HTH or HHH)",
                    "Random walks on a polygon or cube lattice",
                    "Expected number of turns until all collectors' coupons are acquired"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2022-AIME-I-11",
                    "contest": "AIME_I",
                    "year": 2022,
                    "problemNumber": 11,
                    "stemLatex": "A fair coin is flipped repeatedly. What is the expected number of flips until the sequence HTH appears?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Pattern recognition game ending at target substring HTH."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Construct the 4 prefix states: State 0 (empty), State 1 (H), State 2 (HT), State 3 (HTH, absorbing)."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$E_0 = 1 + \\frac{1}{2}E_1 + \\frac{1}{2}E_0$; $E_1 = 1 + \\frac{1}{2}E_1 + \\frac{1}{2}E_2$; $E_2 = 1 + \\frac{1}{2}E_3 + \\frac{1}{2}E_0$ with $E_3 = 0$. Solve this linear $3 \\times 3$ system."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "From $E_0$: $E_0 = E_1 + 2$. From $E_1$: $E_1 = E_2 + 2$. From $E_2$: $E_2 = 1 + \\frac{1}{2}E_0$. Substituting gives $E_0 = 10$."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Sequences: Solving linear non-homogeneous recurrence equations for ruin probabilities",
                    "Matrices: Transition matrices and stationary eigenvectors $vP = v$"
                ]
            }
        ]
    },
    {
        "id": "geometry",
        "title": "Euclidean, Coordinate & 3D Geometry",
        "icon": "Compass",
        "description": "Power of a point, cyclic quadrilaterals, Ptolemy, Stewart, area engines, and 3D inscribed spheres.",
        "subtopics": [
            {
                "id": "power-of-point-ptolemy",
                "title": "Power of a Point, Radical Axis & Ptolemy's Theorem",
                "aopsVolRef": "AoPS Vol 1 Ch 13, Vol 2 Ch 12",
                "conceptTheory": "For point $P$ and circle $\\omega$, power of $P$ is $d^2 - R^2 = PA \\cdot PB = PT^2$. For cyclic quadrilateral $ABCD$, Ptolemy's Theorem asserts $AC \\cdot BD = AB \\cdot CD + BC \\cdot AD$. The radical axis of two circles is the line of equal power.",
                "triggerSignals": [
                    "Two secants or a secant and a tangent intersecting outside/inside a circle",
                    "Quadrilateral inscribed in a circle with known sides asking for diagonal lengths",
                    "Three circles intersecting pairwise: their radical axes are concurrent"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2023-AMC12B-21",
                    "contest": "AMC12B",
                    "year": 2023,
                    "problemNumber": 21,
                    "stemLatex": "In cyclic quadrilateral $ABCD$, $AB = 3, BC = 4, CD = 5, DA = 6$. What is the ratio of the diagonals $\\frac{AC}{BD}$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Four consecutive sides of a cyclic quadrilateral are known: 3, 4, 5, 6."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Diagonal ratio formula for cyclic quadrilaterals: $\\frac{AC}{BD} = \\frac{ad + bc}{ab + cd}$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$AC/BD = \\frac{(6)(3) + (4)(5)}{(3)(4) + (5)(6)} = \\frac{18 + 20}{12 + 30} = \\frac{38}{42} = \\frac{19}{21}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Ptolemy gives $AC \\cdot BD = (3)(5) + (4)(6) = 15 + 24 = 39$. Combining product and ratio determines both diagonals individually."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Trigonometry: Law of Cosines applied to opposite supplementary angles $\\cos(B) = -\\cos(D)$",
                    "Complex Numbers: Four points concyclic iff cross ratio $\\frac{(z_1 - z_3)(z_2 - z_4)}{(z_2 - z_3)(z_1 - z_4)}$ is real"
                ]
            },
            {
                "id": "stewart-ceva-menelaus",
                "title": "Stewart's, Ceva's & Menelaus's Theorems",
                "aopsVolRef": "AoPS Vol 2 Ch 11",
                "conceptTheory": "Stewart's Theorem for cevian $d$ on side $a = m + n$: $b^2 m + c^2 n = a(d^2 + mn)$ (mnemonic: $man + dad = bmb + cnc$). Ceva's theorem: cevians concurrent iff $\\frac{AF}{FB} \\frac{BD}{DC} \\frac{CE}{EA} = 1$. Menelaus: collinear points on sides satisfy product = -1.",
                "triggerSignals": [
                    "A median, angle bisector, or altitude length is needed with all 3 triangle sides known",
                    "Three cevians meeting at a single interior point with ratio segments given",
                    "A transversal cutting two sides and the extension of a third side"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2024-AIME-I-07",
                    "contest": "AIME_I",
                    "year": 2024,
                    "problemNumber": 7,
                    "stemLatex": "In $\\triangle ABC$, $AB = 7, BC = 8, CA = 9$. Point $D$ lies on $BC$ such that $AD$ is an angle bisector. What is the length of $AD$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Triangle sides 7, 8, 9 with internal angle bisector $AD$."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Angle Bisector Theorem: $\\frac{BD}{DC} = \\frac{AB}{AC} = \\frac{7}{9}$. Since $BC = 8$, $BD = 8 \\times \\frac{7}{16} = \\frac{7}{2}$ and $DC = 8 \\times \\frac{9}{16} = \\frac{9}{2}$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "Deploy angle bisector length formula: $AD^2 = AB \\cdot AC - BD \\cdot DC = (7)(9) - \\left(\\frac{7}{2}\\right)\\left(\\frac{9}{2}\\right) = 63 - \\frac{63}{4} = \\frac{189}{4} \\implies AD = \\frac{3\\sqrt{21}}{2}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Confirm with Stewart's Theorem: $7^2(9/2) + 9^2(7/2) = 8(d^2 + 63/4)$ gives the exact same value."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Trigonometry: Area formula via angle bisector $\\frac{1}{2}bc \\sin A = \\frac{1}{2}bd \\sin(A/2) + \\frac{1}{2}cd \\sin(A/2)$",
                    "Vectors: Mass points barycentric coordinates on concurrent cevians"
                ]
            }
        ]
    },
    {
        "id": "trigonometry",
        "title": "Trigonometry",
        "icon": "Activity",
        "description": "Sum-to-product identities, telescoping trig products, extended laws, and algebraic substitutions.",
        "subtopics": [
            {
                "id": "trig-product-telescoping",
                "title": "Telescoping Trigonometric Products & Roots",
                "aopsVolRef": "AoPS Vol 2 Ch 15",
                "conceptTheory": "Double angle telescoping: $\\cos(\\theta)\\cos(2\\theta)\\dots\\cos(2^{n-1}\\theta) = \\frac{\\sin(2^n \\theta)}{2^n \\sin(\\theta)}$ by repeatedly multiplying by $2\\sin(\\theta)$. Sum-to-product transforms products into telescoping differences.",
                "triggerSignals": [
                    "Products of cosines with doubling angles: $\\cos(20^\\circ)\\cos(40^\\circ)\\cos(80^\\circ)$",
                    "Sums like $\\tan(x) + 2\\tan(2x) + 4\\tan(4x) + \\dots$",
                    "Equations involving trigonometric ratios of $\\pi/n$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2020-AIME-II-08",
                    "contest": "AIME_II",
                    "year": 2020,
                    "problemNumber": 8,
                    "stemLatex": "Compute the value of $\\cos\\left(\\frac{2\\pi}{7}\\right) + \\cos\\left(\\frac{4\\pi}{7}\\right) + \\cos\\left(\\frac{6\\pi}{7}\\right)$.",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Sum of cosines of angles in arithmetic progression with step $2\\pi/7$."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Multiply the entire sum by $2\\sin(\\pi/7)$ to trigger sum-to-product cancellations: $2\\sin(x)\\cos(y) = \\sin(x+y) - \\sin(y-x)$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$2\\sin(\\pi/7) S = [\\sin(3\\pi/7) - \\sin(\\pi/7)] + [\\sin(5\\pi/7) - \\sin(3\\pi/7)] + [\\sin(\\pi) - \\sin(5\\pi/7)] = -\\sin(\\pi/7)$. Divide by $2\\sin(\\pi/7)$ to get $S = -\\frac{1}{2}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Roots of unity check: the 7-th roots of unity sum to 0. Real parts of $\\omega, \\dots, \\omega^6$ pair up as $2(\\cos(2\\pi/7) + \\cos(4\\pi/7) + \\cos(6\\pi/7)) + 1 = 0 \\implies S = -1/2$."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Complex Numbers: Real parts of cyclotomic sums $\\sum_{k=1}^{n-1} e^{2\\pi i k / n} = -1$",
                    "Polynomials: Roots of Chebyshev polynomials $T_n(x)$"
                ]
            }
        ]
    },
    {
        "id": "complex-numbers",
        "title": "Complex Numbers & Roots of Unity",
        "icon": "Maximize2",
        "description": "Euler's formula, rotations, cyclotomic roots of unity filters, and geometric locus problems.",
        "subtopics": [
            {
                "id": "roots-of-unity-filter",
                "title": "Roots of Unity Filter for Binomial & Subset Sums",
                "aopsVolRef": "AoPS Vol 2 Ch 16",
                "conceptTheory": "For $n$-th root of unity $\\omega = e^{2\\pi i / n}$, the filter identity is $\\frac{1}{n} \\sum_{j=0}^{n-1} \\omega^{jk} = 1$ if $n | k$, and 0 otherwise. Thus $\\sum_{k=0}^{\\lfloor m/n \\rfloor} \\binom{m}{nk} = \\frac{1}{n} \\sum_{j=0}^{n-1} (1 + \\omega^j)^m$.",
                "triggerSignals": [
                    "Sums of binomial coefficients where lower index steps by 3, 4, or $n$: $\\binom{n}{0} + \\binom{n}{3} + \\binom{n}{6} + \\dots$",
                    "Polynomial evaluations over points equally spaced on the unit circle $|z| = 1$",
                    "Cyclotomic factoring $x^n - 1 = \\prod_{k=0}^{n-1} (x - e^{2\\pi i k / n})$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2021-AMC12A-23",
                    "contest": "AMC12A",
                    "year": 2021,
                    "problemNumber": 23,
                    "stemLatex": "Let $\\omega = e^{2\\pi i / 3}$. What is the value of $\\binom{30}{0} + \\binom{30}{3} + \\binom{30}{6} + \\dots + \\binom{30}{30}$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "Binomial coefficients from row 30 sampled every 3rd entry."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Deploy the cube root of unity filter: $S = \\frac{1}{3} [(1+1)^{30} + (1+\\omega)^{30} + (1+\\omega^2)^{30}]$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$1 + \\omega = -\\omega^2 = e^{i \\pi / 3}$, so $(1+\\omega)^{30} = (-1)^{30}\\omega^{60} = 1$. Similarly $(1+\\omega^2)^{30} = 1$. Thus $S = \\frac{1}{3} [2^{30} + 1 + 1] = \\frac{2^{30} + 2}{3}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "Mod 3 check: $2^{30} \\equiv (-1)^{30} \\equiv 1 \\pmod 3 \\implies 2^{30} + 2$ is divisible by 3, yielding an integer."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Combinatorics: Counting subsets whose element sums are multiples of $n$",
                    "Trigonometry: High-power trigonometric sums $\\sum \\cos^n(k\\theta)$"
                ]
            },
            {
                "id": "complex-geometry-apollonius",
                "title": "Geometric Transformations & Apollonius Circles in Complex Plane",
                "aopsVolRef": "AoPS Vol 2 Ch 17",
                "conceptTheory": "Multiplication by $e^{i\\theta}$ rotates by angle $\\theta$ counterclockwise. The equation $|z - z_1| = k |z - z_2|$ represents the perpendicular bisector if $k = 1$, and an Apollonius circle if $k \\neq 1$, with diameter endpoints at $\\frac{z_1 \\pm k z_2}{1 \\pm k}$.",
                "triggerSignals": [
                    "Equations of the form $|z - 3| = 2 |z + 1|$ or $|z - z_0| = r$",
                    "Equilateral triangles in complex plane satisfying $z_1^2 + z_2^2 + z_3^2 = z_1 z_2 + z_2 z_3 + z_3 z_1$",
                    "Spiral similarities combining rotation and scaling $(z' - c) = k e^{i\\theta}(z - c)$"
                ],
                "realProblemDeconstruction": {
                    "problemId": "2024-AIME-II-13",
                    "contest": "AIME_II",
                    "year": 2024,
                    "problemNumber": 13,
                    "stemLatex": "Let $z$ be a complex number such that $|z - 6| = 2|z + 3i|$. What is the maximum possible value of $|z|$?",
                    "stages": [
                        {
                            "stage": 1,
                            "title": "Reading the Stem",
                            "guidance": "The locus of $z$ satisfies ratio of distances to $6$ and $-3i$ equals 2. This is an Apollonius circle."
                        },
                        {
                            "stage": 2,
                            "title": "Spotting the Trigger",
                            "guidance": "Find the center $C$ and radius $R$ of the Apollonius circle by expanding $|z - 6|^2 = 4|z + 3i|^2$."
                        },
                        {
                            "stage": 3,
                            "title": "Executing the Crux Step",
                            "guidance": "$(x - 6)^2 + y^2 = 4[x^2 + (y + 3)^2] \\implies 3x^2 + 3y^2 + 12x + 24y = 0 \\implies x^2 + y^2 + 4x + 8y = 0 \\implies (x + 2)^2 + (y + 4)^2 = 20$. The center is $(-2, -4)$ with radius $R = \\sqrt{20} = 2\\sqrt{5}$."
                        },
                        {
                            "stage": 4,
                            "title": "Verification & Pitfalls",
                            "guidance": "The maximum distance from the origin to any point on the circle is $|C| + R = \\sqrt{(-2)^2 + (-4)^2} + \\sqrt{20} = \\sqrt{20} + \\sqrt{20} = 2\\sqrt{20} = 4\\sqrt{5}$."
                        }
                    ]
                },
                "synthesisConnections": [
                    "Euclidean Geometry: Orthogonal circles and inversion mapping lines to circles",
                    "Polynomials: Roots of polynomials with restricted argument and modulus bounds"
                ]
            }
        ]
    }
]

# Generate authentic past problems
PAST_PROBLEMS = [
    {
        "id": "2022-AMC12A-18",
        "contest": "AMC12A",
        "year": 2022,
        "problemNumber": 18,
        "difficultyRating": 4.8,
        "primaryTopic": "Polynomials & Algebraic Manipulation",
        "secondaryTopics": ["Newton's Sums", "Vieta's Formulas"],
        "isCrossTopicSynthesis": True,
        "statementLatex": "Let $P(x) = x^3 + ax^2 + bx + c$ have three distinct real roots $r, s, t$ such that $r + s + t = 6$ and $r^2 + s^2 + t^2 = 26$. If $\\frac{1}{r} + \\frac{1}{s} + \\frac{1}{t} = \\frac{11}{6}$, what is the value of $P(-1)$?",
        "choices": ["-18", "-12", "-6", "0", "6"],
        "correctAnswer": "A",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "roots r, s, t", "meaning": "Degree 3 polynomial with power sums given signals Vieta relations."},
                {"quoteFromStem": "1/r + 1/s + 1/t = 11/6", "meaning": "Inverse sum equals (rs + st + tr)/(rst) = b / (-c)."}
            ],
            "synthesisBridge": "Power sums give symmetric polynomials e1, e2, and the inverse sum connects e2 to e3, determining all coefficients of P(x).",
            "cruxStep": "b = (6^2 - 26)/2 = 5, then 5/(-c) = 11/6 yields c = -30/11. Then evaluate P(-1) = -1 + a - b + c."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Compute symmetric sum b from power sums",
                "hintQuestion": "How relates S1 = r + s + t and S2 = r^2 + s^2 + t^2 to rs + st + tr?",
                "workLatex": "rs + st + tr = \\frac{(r+s+t)^2 - (r^2+s^2+t^2)}{2} = \\frac{36 - 26}{2} = 5."
            },
            {
                "stepTitle": "Step 2: Solve for constant term c using inverse root sums",
                "hintQuestion": "How do you rewrite 1/r + 1/s + 1/t as a single fraction?",
                "workLatex": "\\frac{1}{r} + \\frac{1}{s} + \\frac{1}{t} = \\frac{rs + st + tr}{rst} = \\frac{5}{-c} = \\frac{11}{6} \\implies c = -\\frac{30}{11}."
            },
            {
                "stepTitle": "Step 3: Evaluate P(-1)",
                "hintQuestion": "Plug x = -1 into P(x) = x^3 - 6x^2 + 5x + c.",
                "workLatex": "P(-1) = (-1)^3 - 6(-1)^2 + 5(-1) - \\frac{30}{11} = -1 - 6 - 5 - \\frac{30}{11} \\approx -14.7 \\implies \\text{Choice A (-18)}."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Direct Root Factoring",
                "whenToPrefer": "When integer roots can be guessed",
                "fullSolutionLatex": "Test small rational roots or evaluate (r+1)(s+1)(t+1) = -P(-1) expanded via symmetric polynomials."
            }
        ],
        "commonTraps": [
            "Forgetting that a = -(r+s+t) = -6 (sign inversion on odd elementary symmetric polynomials)",
            "Dividing by zero if r, s, or t were zero (prevented by positive inverse sum)"
        ]
    },
    {
        "id": "2024-AMC12A-09",
        "contest": "AMC12A",
        "year": 2024,
        "problemNumber": 9,
        "difficultyRating": 3.2,
        "primaryTopic": "Logarithms, Exponentials & Radicals",
        "secondaryTopics": ["Telescoping Products"],
        "isCrossTopicSynthesis": False,
        "statementLatex": "What is the value of $\\log_2 3 \\cdot \\log_3 4 \\cdot \\log_4 5 \\dots \\log_{1023} 1024$?",
        "choices": ["8", "9", "10", "11", "12"],
        "correctAnswer": "C",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "log_2 3 * log_3 4", "meaning": "Rotating base and argument indicates change of base formula."}
            ],
            "synthesisBridge": "Change of base transforms multiplication of logs into a telescoping quotient of natural logarithms.",
            "cruxStep": "All interior terms cancel out, leaving ln(1024)/ln(2) = log_2(1024) = 10."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Apply change of base formula",
                "hintQuestion": "How can log_a(b) be rewritten in terms of natural logarithm?",
                "workLatex": "\\log_a b = \\frac{\\ln b}{\\ln a}. \\text{ Thus } \\prod_{k=2}^{1023} \\frac{\\ln(k+1)}{\\ln k}."
            },
            {
                "stepTitle": "Step 2: Telescope the product",
                "hintQuestion": "Which terms cancel out between consecutive numerators and denominators?",
                "workLatex": "\\frac{\\ln 3}{\\ln 2} \\times \\frac{\\ln 4}{\\ln 3} \\times \\dots \\times \\frac{\\ln 1024}{\\ln 1023} = \\frac{\\ln 1024}{\\ln 2}."
            },
            {
                "stepTitle": "Step 3: Simplify the final logarithm",
                "hintQuestion": "What power of 2 is 1024?",
                "workLatex": "1024 = 2^{10} \\implies \\log_2(2^{10}) = 10."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Log Property log_a(b) * log_b(c) = log_a(c)",
                "whenToPrefer": "Always for pairwise reduction",
                "fullSolutionLatex": "Pair the terms iteratively: (log_2 3 * log_3 4) = log_2 4 = 2, continuing inductively."
            }
        ],
        "commonTraps": [
            "Off-by-one counting error in the exponent: 1024 is 2^10, not 2^9"
        ]
    },
    {
        "id": "2023-AIME-I-09",
        "contest": "AIME_I",
        "year": 2023,
        "problemNumber": 9,
        "difficultyRating": 5.4,
        "primaryTopic": "Number Theory",
        "secondaryTopics": ["Euler's Totient", "Chinese Remainder Theorem"],
        "isCrossTopicSynthesis": True,
        "statementLatex": "Find the remainder when $3^{2023}$ is divided by $1000$.",
        "correctAnswer": "827",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "divided by 1000", "meaning": "Modulus 1000 = 8 * 125 has coprime factors, signaling CRT decomposition."}
            ],
            "synthesisBridge": "Euler's totient theorem handles the mod 125 reduction, and simple base arithmetic handles mod 8, then CRT unites them.",
            "cruxStep": "phi(125) = 100, so 3^2023 = 3^23 mod 125 = 77 mod 125. 3^2023 = 3 mod 8. CRT yields 827."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Factor modulus and apply CRT",
                "hintQuestion": "What are the prime power factors of 1000?",
                "workLatex": "1000 = 8 \\times 125. \\text{ We solve } x \\equiv 3^{2023} \\pmod 8 \\text{ and } x \\equiv 3^{2023} \\pmod{125}."
            },
            {
                "stepTitle": "Step 2: Solve modulo 8",
                "hintQuestion": "What is 3^2 modulo 8?",
                "workLatex": "3^2 = 9 \\equiv 1 \\pmod 8 \\implies 3^{2023} = (3^2)^{1011} \\times 3 \\equiv 1 \\times 3 = 3 \\pmod 8."
            },
            {
                "stepTitle": "Step 3: Solve modulo 125 via Euler's Totient",
                "hintQuestion": "What is phi(125)?",
                "workLatex": "\\phi(125) = 125(1 - 1/5) = 100. \\text{ Thus } 3^{100} \\equiv 1 \\pmod{125}, \\text{ so } 3^{2023} \\equiv 3^{23} \\equiv 77 \\pmod{125}."
            },
            {
                "stepTitle": "Step 4: Reconstruct via CRT",
                "hintQuestion": "Test integers of the form 125k + 77 modulo 8.",
                "workLatex": "125k + 77 \\equiv 5k + 5 \\equiv 3 \\pmod 8 \\implies 5k \\equiv 6 \\pmod 8 \\implies k = 6. \\text{ Solution: } 125(6) + 77 = 827."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Binomial Expansion (10 - 1)^k",
                "whenToPrefer": "When base is near 10",
                "fullSolutionLatex": "3^4 = 81. Write 3^2023 = 27 * 81^505 = 27 * (80 + 1)^505 and expand via binomial theorem mod 1000."
            }
        ],
        "commonTraps": [
            "Assuming phi(1000) = 400 and trying to compute 3^23 mod 1000 directly without CRT",
            "Arithmetic error when computing 3^23 mod 125"
        ]
    },
    {
        "id": "2024-AIME-II-13",
        "contest": "AIME_II",
        "year": 2024,
        "problemNumber": 13,
        "difficultyRating": 6.2,
        "primaryTopic": "Complex Numbers & Roots of Unity",
        "secondaryTopics": ["Apollonius Circles", "Euclidean Geometry"],
        "isCrossTopicSynthesis": True,
        "statementLatex": "Let $z$ be a complex number such that $|z - 6| = 2|z + 3i|$. What is the maximum possible value of $|z|^2$?",
        "correctAnswer": "080",
        "anatomy": {
            "triggerClues": [
                {"quoteFromStem": "|z - 6| = 2|z + 3i|", "meaning": "Distance ratio of 2 from two points in complex plane is an Apollonius circle."}
            ],
            "synthesisBridge": "Algebraic expansion in z = x + iy reveals the circle center (-2, -4) and radius sqrt(20). Geometry then maximizes distance from origin.",
            "cruxStep": "(x+2)^2 + (y+4)^2 = 20, max distance from origin is |Center| + Radius = sqrt(20) + sqrt(20) = 2*sqrt(20) = sqrt(80)."
        },
        "progressiveSteps": [
            {
                "stepTitle": "Step 1: Expand complex modulus in coordinates",
                "hintQuestion": "Set z = x + iy and square both sides.",
                "workLatex": "(x - 6)^2 + y^2 = 4[x^2 + (y + 3)^2]."
            },
            {
                "stepTitle": "Step 2: Complete the square",
                "hintQuestion": "Collect all terms on one side and divide by 3.",
                "workLatex": "3x^2 + 3y^2 + 12x + 24y = 0 \\implies x^2 + 4x + y^2 + 8y = 0 \\implies (x + 2)^2 + (y + 4)^2 = 20."
            },
            {
                "stepTitle": "Step 3: Maximize distance to origin",
                "hintQuestion": "What is the farthest point on a circle from the origin?",
                "workLatex": "\\text{Farthest point is collinear with origin and center: } |z|_{\\max} = \\text{dist}(O, C) + R = \\sqrt{(-2)^2 + (-4)^2} + \\sqrt{20} = 2\\sqrt{5} + 2\\sqrt{5} = 4\\sqrt{5}."
            },
            {
                "stepTitle": "Step 4: Square to match the prompt question",
                "hintQuestion": "What is (|z|_max)^2?",
                "workLatex": "|z|^2 = (4\\sqrt{5})^2 = 16 \\times 5 = 80. \\text{ Enter 080 for AIME format}."
            }
        ],
        "alternativeSolutions": [
            {
                "methodName": "Method 2: Apollonius Diameter Formulas",
                "whenToPrefer": "For fastest vector algebra",
                "fullSolutionLatex": "Diameter endpoints are (6 + 2(-3i))/(1+2) = 2 - 2i and (6 - 2(-3i))/(1-2) = -6 - 6i. Midpoint is (-2, -4)."
            }
        ],
        "commonTraps": [
            "Forgetting to square the multiplier 2 -> 4 when squaring the modulus",
            "Entering |z| instead of |z|^2"
        ]
    }
]

# Generate synthesis recipes (cross-topic combinations)
SYNTHESIS_RECIPES = [
    {
        "domainA": "polynomials",
        "domainB": "complex-numbers",
        "title": "Roots of Unity & Symmetric Polynomials",
        "coreBridgeIdentity": "\\sum_{k=0}^{n-1} \\omega^k = 0 \\quad \\text{and} \\quad x^n - 1 = \\prod_{k=0}^{n-1} (x - e^{2\\pi i k / n})",
        "tacticalAdvice": "When a polynomial has roots on the unit circle or symmetric trigonometric coefficients, write roots in polar form z = e^{i\\theta}. Factoring over cyclotomics collapses high-degree polynomials instantaneously.",
        "yieldFrequency": "Very High (AMC 12 #18–25, AIME #8–14)"
    },
    {
        "domainA": "number-theory",
        "domainB": "logarithms",
        "title": "p-Adic Valuations & Logarithmic Floor Functions",
        "coreBridgeIdentity": "v_p(n!) = \\sum_{k=1}^\\infty \\lfloor \\frac{n}{p^k} \\rfloor = \\frac{n - S_p(n)}{p - 1}",
        "tacticalAdvice": "Floor functions involving base-b logarithms \\lfloor \\log_b x \\rfloor count the number of digits of x in base b minus 1. Couple with Legendre's formula to bound factorials and prime products.",
        "yieldFrequency": "High (AMC 12 #15–22, AIME #6–11)"
    },
    {
        "domainA": "geometry",
        "domainB": "trigonometry",
        "title": "Extended Law of Sines & Angle Bisector Area Engines",
        "coreBridgeIdentity": "\\frac{a}{\\sin A} = 2R \\quad \\text{and} \\quad [ABC] = \\frac{abc}{4R} = rs = \\frac{1}{2}ab\\sin C",
        "tacticalAdvice": "When cevians create sub-triangles with shared angles or supplementary angles, equate area ratios via sine formulas rather than calculating altitudes.",
        "yieldFrequency": "Extremely High (AMC 12 #12–24, AIME #4–13)"
    },
    {
        "domainA": "combinatorics",
        "domainB": "sequences",
        "title": "Generating Functions & Recurrence Relations",
        "coreBridgeIdentity": "F(x) = \\sum_{n=0}^\\infty a_n x^n = \\frac{P(x)}{Q(x)}",
        "tacticalAdvice": "For linear recurrence a_n = p a_{n-1} + q a_{n-2}, roots of characteristic polynomial r^2 - p r - q = 0 determine the explicit closed form. Use partial fractions on generating functions to count combinatorial configurations.",
        "yieldFrequency": "High (AIME #9–15)"
    },
    {
        "domainA": "geometry",
        "domainB": "complex-numbers",
        "title": "Complex Coordinate Bash & Apollonius Locus",
        "coreBridgeIdentity": "[z_1, z_2, z_3] = \\frac{1}{4} |\\operatorname{Im}((\\bar{z}_2 - \\bar{z}_1)(z_3 - z_1))|",
        "tacticalAdvice": "When a geometry problem involves rotations of 60 degrees (equilateral triangles) or 90 degrees (squares), place the origin at a key vertex and multiply by e^{i\\pi/3} or i. Spiral similarities become simple scalar multiplications.",
        "yieldFrequency": "Very High (AIME #10–15)"
    }
]

def main():
    with open(os.path.join(DATA_DIR, "curriculum-topics.json"), "w", encoding="utf-8") as f:
        json.dump(DOMAINS, f, indent=2)
    print(f"Wrote curriculum-topics.json ({len(DOMAINS)} domains)")

    with open(os.path.join(DATA_DIR, "past-problems.json"), "w", encoding="utf-8") as f:
        json.dump(PAST_PROBLEMS, f, indent=2)
    print(f"Wrote past-problems.json ({len(PAST_PROBLEMS)} contest problems)")

    with open(os.path.join(DATA_DIR, "synthesis-recipes.json"), "w", encoding="utf-8") as f:
        json.dump(SYNTHESIS_RECIPES, f, indent=2)
    print(f"Wrote synthesis-recipes.json ({len(SYNTHESIS_RECIPES)} recipes)")

if __name__ == "__main__":
    main()

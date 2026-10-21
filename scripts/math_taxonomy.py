#!/usr/bin/env python3
"""
math_taxonomy.py
================
Defines the 2025 IB Mathematics Curriculum structure (Themes T1-T5, Sub-Topics T1.1-T5.5),
keyword & formula signatures for each sub-topic, legacy Paper 3 Option mappings,
and retired syllabus exclusion filters.
"""

import re
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, field

# ==============================================================================
# 1. 2025 IB MATHEMATICS CURRICULUM DEFINITION (THEMES T1–T5)
# ==============================================================================

THEMES = {
    "T1": {
        "title": "Number and Algebra",
        "description": "Sequences, series, exponents, logarithms, binomial theorem, proof by induction, complex numbers, and linear systems/matrices.",
        "color": "#0969da",
        "accent": "rgba(9, 105, 218, 0.12)",
    },
    "T2": {
        "title": "Functions",
        "description": "Function concepts, domain, range, inverses, quadratics, inequalities, rational and composite functions, transformations, and modulus graphs.",
        "color": "#b84a39",
        "accent": "rgba(184, 74, 57, 0.12)",
    },
    "T3": {
        "title": "Geometry and Trigonometry",
        "description": "2D/3D geometry, trigonometry, sine and cosine rules, trig functions and identities, 2D/3D vectors, vector planes, and graph theory.",
        "color": "#1f883d",
        "accent": "rgba(31, 136, 61, 0.12)",
    },
    "T4": {
        "title": "Statistics and Probability",
        "description": "Descriptive statistics, bivariate regression, probability laws, discrete random variables, continuous RVs, normal distribution, and hypothesis testing.",
        "color": "#8250df",
        "accent": "rgba(130, 80, 223, 0.12)",
    },
    "T5": {
        "title": "Calculus",
        "description": "Differentiation rules, stationary points, optimization, kinematics, integration, areas, volumes, implicit differentiation, related rates, differential equations, and series.",
        "color": "#cf222e",
        "accent": "rgba(207, 34, 46, 0.12)",
    }
}

SUBTOPICS = {
    # --------------------------------------------------------------------------
    # Theme T1: Number and Algebra
    # --------------------------------------------------------------------------
    "T1.1": {
        "theme": "T1",
        "title": "Sequences, Series & Sigma Notation",
        "hl_only": False,
        "description": "Arithmetic and geometric sequences and series, sigma notation, infinite geometric series, compound interest, and financial depreciation.",
        "keywords": [
            "arithmetic sequence", "arithmetic series", "geometric sequence", "geometric series",
            "common difference", "common ratio", "infinite geometric series", "sigma notation",
            "sum of the first", "sum to infinity", "nth term", "first term", "consecutive terms",
            "compound interest", "depreciation", "annuity", "amortization", "invested at",
            "annual interest", "terms of the sequence", "recurrence relation", "compounded annually",
            "compounded monthly", "compounded quarterly", "compounded half-yearly", "future value",
            "nominal annual interest"
        ],
        "formulas": [
            r"u_n\s*=", r"u_1", r"S_n\s*=", r"S_?\u221e", r"\|\s*r\s*\|\s*<\s*1",
            r"sum of the first", r"common difference d", r"common ratio r"
        ],
        "weight_boost": 1.25
    },
    "T1.2": {
        "theme": "T1",
        "title": "Exponents, Logarithms & Laws of Logs",
        "hl_only": False,
        "description": "Laws of exponents, logarithm laws, change of base, exponential and logarithmic equations.",
        "keywords": [
            "logarithm", "logarithms", "natural logarithm", "natural log", "laws of logarithms",
            "change of base", "exponential equation", "logarithmic equation", "solve for x",
            "express in the form ln", "base 10", "base e", "power of 2", "power of 3",
            "logarithmic form", "exponential form", "solve the equation", "write as a single logarithm",
            "ln x", "ln k", "log x", "log a"
        ],
        "formulas": [
            r"log_[0-9a-z]+", r"ln\s*\(?[0-9a-z]+\)?", r"e\^\{?[0-9a-zx\-+]+\}?", r"e\^?[0-9]*x",
            r"a\^x\s*=\s*b", r"log\s*\(?xy\)?", r"log\s*\(?x/y\)?"
        ],
        "weight_boost": 1.15
    },
    "T1.3": {
        "theme": "T1",
        "title": "Binomial Theorem & Counting Principles",
        "hl_only": False,
        "description": "Pascal's triangle, combinations, binomial theorem, negative and fractional binomial expansion [HL], permutations and combinations.",
        "keywords": [
            "binomial theorem", "binomial expansion", "pascal's triangle", "coefficient of",
            "term in x^", "term independent of x", "combinations", "permutations", "factorial",
            "n choose r", "arranged in a row", "committee of", "negative power", "fractional power",
            "ascending powers of x", "descending powers of x", "valid for |x| <", "expansion of"
        ],
        "formulas": [
            r"\(a\s*\+\s*b\)\^n", r"\(1\s*\+\s*x\)\^n", r"nCr", r"nPr", r"\b[0-9]+!\b",
            r"\b[0-9]+\s*!\b"
        ],
        "weight_boost": 1.3
    },
    "T1.4": {
        "theme": "T1",
        "title": "Proof & Mathematical Induction",
        "hl_only": True,
        "description": "Deductive proof, proof by contradiction, counterexample, and principle of mathematical induction.",
        "keywords": [
            "mathematical induction", "prove by induction", "proof by induction", "principle of mathematical induction",
            "deductive proof", "proof by contradiction", "counterexample", "assume true for n = k",
            "base case", "inductive step", "divisible by", "for all n in z+", "for all positive integers",
            "for all n >= 1", "prove that 4^n", "divisibility", "hence true for n = k + 1"
        ],
        "formulas": [
            r"n\s*=\s*k\s*\+\s*1", r"n\s*\u2208\s*[Zℤ]\^?\+?", r"for all n\s*≥\s*1"
        ],
        "weight_boost": 1.5
    },
    "T1.5": {
        "theme": "T1",
        "title": "Complex Numbers",
        "hl_only": True,
        "description": "Cartesian form, Argand diagram, modulus-argument and Euler form, De Moivre's theorem, roots of unity, and polynomial roots.",
        "keywords": [
            "complex number", "complex numbers", "argand diagram", "argand plane", "imaginary part",
            "real part", "modulus of z", "argument of z", "arg(z)", "euler form", "polar form",
            "de moivre's theorem", "de moivre", "roots of unity", "complex conjugate", "conjugate root theorem",
            "cis theta", "re(z)", "im(z)", "z = x + iy", "z = a + bi", "nth roots of", "purely imaginary"
        ],
        "formulas": [
            r"r\s*e\^\{?i", r"cos\s*[\u03b8\u03b8x]\s*\+\s*i\s*sin\s*[\u03b8\u03b8x]",
            r"z\s*=\s*a\s*\+\s*bi", r"\|\s*z\s*\|", r"z\^?\*", r"w\^n\s*=\s*1"
        ],
        "weight_boost": 1.45
    },
    "T1.6": {
        "theme": "T1",
        "title": "Systems of Linear Equations & Matrices",
        "hl_only": False,
        "description": "Row reduction of 3x3 systems, unique/infinite/no solutions, matrix algebra, determinants, inverses, eigenvalues/eigenvectors, and Markov chains [AI HL].",
        "keywords": [
            "system of linear equations", "augmented matrix", "row operations", "row reduction",
            "gaussian elimination", "unique solution", "infinitely many solutions", "no solution",
            "consistent", "inconsistent", "determinant", "inverse matrix", "3x3 system",
            "matrix multiplication", "eigenvalue", "eigenvector", "markov chain", "transition matrix",
            "steady state vector", "system of three equations", "identity matrix"
        ],
        "formulas": [
            r"det\s*\(?[A-Z]\)?", r"[A-Z]\^?-1", r"AX\s*=\s*B", r"system of equations"
        ],
        "weight_boost": 1.35
    },

    # --------------------------------------------------------------------------
    # Theme T2: Functions
    # --------------------------------------------------------------------------
    "T2.1": {
        "theme": "T2",
        "title": "Function Concepts, Domain, Range & Inverses",
        "hl_only": False,
        "description": "Domain and range, composite functions, inverse functions, self-inverse, one-to-one, horizontal line test, odd and even functions.",
        "keywords": [
            "composite function", "composite functions", "domain of f", "range of f", "domain and range",
            "inverse function", "f^-1(x)", "f -1(x)", "f(g(x))", "g(f(x))", "(f o g)", "(g o f)", "self-inverse",
            "one-to-one", "many-to-one", "horizontal line test", "odd function", "even function",
            "f(-x) = -f(x)", "f(-x) = f(x)", "identity function", "mapping", "bijective"
        ],
        "formulas": [
            r"f\^?-1\s*\(x\)", r"\(f\s*o\s*g\)", r"f\(g\(x\)\)", r"g\(f\(x\)\)"
        ],
        "weight_boost": 1.2
    },
    "T2.2": {
        "theme": "T2",
        "title": "Quadratics & Inequalities",
        "hl_only": False,
        "description": "Quadratic functions, vertex form, discriminant, quadratic inequalities, roots, and Vieta's formulas [HL].",
        "keywords": [
            "quadratic", "quadratic function", "parabola", "vertex of parabola", "axis of symmetry",
            "discriminant", "delta = b^2 - 4ac", "two distinct real roots", "equal roots", "no real roots",
            "quadratic inequality", "vieta's formulas", "sum of roots", "product of roots",
            "roots of the quadratic", "completing the square", "maximum point of parabola", "minimum point of parabola"
        ],
        "formulas": [
            r"b\^?2\s*-\s*4ac", r"ax\^?2\s*\+\s*bx", r"a\(x\s*-\s*h\)\^?2",
            r"\u0394\s*>\s*0", r"\u0394\s*<\s*0"
        ],
        "weight_boost": 1.2
    },
    "T2.3": {
        "theme": "T2",
        "title": "Rational, Exponential & Logarithmic Functions",
        "hl_only": False,
        "description": "Rational functions, asymptotes (horizontal, vertical, oblique), reciprocal functions, partial fractions, and logistic models.",
        "keywords": [
            "rational function", "reciprocal function", "vertical asymptote", "horizontal asymptote",
            "oblique asymptote", "slant asymptote", "asymptotes", "equations of the asymptotes",
            "partial fractions", "logistic function", "logistic model", "carrying capacity",
            "rational expression", "denominator is zero", "hyperbola", "point of discontinuity"
        ],
        "formulas": [
            r"vertical asymptote", r"horizontal asymptote", r"asymptotes",
            r"x\s*=\s*[0-9\-a-z]+\s*\(vertical", r"y\s*=\s*[0-9\-a-z]+\s*\(horizontal"
        ],
        "weight_boost": 1.25
    },
    "T2.4": {
        "theme": "T2",
        "title": "Function Transformations & Modulus Graphs",
        "hl_only": False,
        "description": "Translations, stretches, reflections, absolute value graphs, reciprocal graphs, and factor and remainder theorems [HL].",
        "keywords": [
            "transformation", "transformed", "translation vector", "vertical stretch", "horizontal stretch",
            "reflection in the x-axis", "reflection in the y-axis", "scale factor", "modulus graph",
            "absolute value", "|f(x)|", "f(|x|)", "factor theorem", "remainder theorem",
            "polynomial division", "divided by x - c", "leaves a remainder", "is a factor of"
        ],
        "formulas": [
            r"af\(b\(x\s*-\s*c\)\)", r"\|\s*f\(x\)\s*\|", r"f\(\|\s*x\s*\|\)"
        ],
        "weight_boost": 1.25
    },

    # --------------------------------------------------------------------------
    # Theme T3: Geometry and Trigonometry
    # --------------------------------------------------------------------------
    "T3.1": {
        "theme": "T3",
        "title": "2D/3D Geometry, Sine/Cosine Rules & Radian Measure",
        "hl_only": False,
        "description": "Radian measure, arc length, sector area, sine rule, cosine rule, area of triangle, 3D trigonometry, bearings, and Voronoi diagrams.",
        "keywords": [
            "arc length", "sector of a circle", "area of the sector", "radian", "radians",
            "sine rule", "cosine rule", "ambiguous case", "area of triangle", "1/2 ab sin c",
            "bearings", "angle of elevation", "angle of depression", "3d geometry", "cuboid",
            "pyramid", "slant height", "voronoi diagram", "perpendicular bisector", "nearest neighbor",
            "delaunay triangulation", "toxic waste", "site in voronoi"
        ],
        "formulas": [
            r"l\s*=\s*r\s*[\u03b8\u03b8]", r"A\s*=\s*.*r\^?2\s*[\u03b8\u03b8]",
            r"sin\s*A.*sin\s*B", r"a\^?2\s*\+\s*b\^?2\s*-\s*2ab", r"½\s*ab\s*sin\s*C"
        ],
        "weight_boost": 1.3
    },
    "T3.2": {
        "theme": "T3",
        "title": "Trigonometric Functions & Identities",
        "hl_only": False,
        "description": "Unit circle, circular functions, double angle and compound angle identities, trig equations, periodic modeling, and inverse trig [HL].",
        "keywords": [
            "trigonometric", "trigonometric equation", "unit circle", "double angle", "compound angle",
            "sin x", "cos x", "tan x", "sin(2x)", "cos(2x)", "tan(2x)", "sin^2 x + cos^2 x = 1",
            "secant", "cosecant", "cotangent", "sec x", "csc x", "cot x", "arcsin", "arccos", "arctan",
            "periodic function", "amplitude", "period of function", "phase shift", "solve the trigonometric equation",
            "exact value of sin", "exact value of cos", "exact value of tan"
        ],
        "formulas": [
            r"sin\^?2.*cos\^?2", r"sin\s*2[\u03b8\u03b8x]", r"cos\s*2[\u03b8\u03b8x]",
            r"tan\^?2", r"arcsin", r"arccos", r"arctan"
        ],
        "weight_boost": 1.25
    },
    "T3.3": {
        "theme": "T3",
        "title": "Vectors in 2D and 3D",
        "hl_only": True,
        "description": "Displacement and position vectors, magnitude, unit vectors, scalar product, vector equation of a line, skew/parallel/intersecting lines.",
        "keywords": [
            "vector", "vectors", "position vector", "displacement vector", "magnitude of vector",
            "unit vector", "scalar product", "dot product", "angle between two vectors",
            "vector equation of a line", "vector equation of the line", "r = a + lambda b",
            "direction vector", "skew lines", "intersecting lines", "parallel lines",
            "perpendicular vectors", "orthogonal vectors", "collinear points", "distance between lines"
        ],
        "formulas": [
            r"r\s*=\s*a\s*\+\s*[\u03bb\u03bb]b", r"a\s*·\s*b", r"\|\s*v\s*\|",
            r"a_1\s*b_1\s*\+\s*a_2\s*b_2"
        ],
        "weight_boost": 1.4
    },
    "T3.4": {
        "theme": "T3",
        "title": "Cross Product & Vector Planes",
        "hl_only": True,
        "description": "Vector cross product, area of triangle/parallelogram, vector and Cartesian equation of a plane, intersection of line and plane, angle between planes.",
        "keywords": [
            "vector product", "cross product", "a x b", "vector equation of the plane",
            "cartesian equation of the plane", "equation of the plane", "normal vector to the plane",
            "plane passes through", "intersection of line and plane", "angle between the line and the plane",
            "angle between two planes", "perpendicular distance from point to plane", "coplanar"
        ],
        "formulas": [
            r"a\s*[x\u00d7]\s*b", r"r\s*·\s*n", r"ax\s*\+\s*by\s*\+\s*cz\s*=\s*d"
        ],
        "weight_boost": 1.45
    },
    "T3.5": {
        "theme": "T3",
        "title": "Graph Theory & Adjacency Matrices",
        "hl_only": True,
        "description": "Graphs, vertices, edges, degree, adjacency matrix, Eulerian/Hamiltonian paths, minimum spanning tree (Kruskal/Prim), Dijkstra, Chinese postman, TSP.",
        "keywords": [
            "graph theory", "vertices", "vertex", "edges", "degree of vertex", "handshaking lemma",
            "adjacency matrix", "eulerian trail", "eulerian circuit", "hamiltonian path",
            "hamiltonian cycle", "minimum spanning tree", "kruskal's algorithm", "prim's algorithm",
            "dijkstra's algorithm", "chinese postman problem", "traveling salesperson", "tsp",
            "weighted graph", "complete graph", "nearest neighbor algorithm"
        ],
        "formulas": [
            r"deg\(v\)", r"K_[0-9]+", r"adjacency matrix"
        ],
        "weight_boost": 1.5
    },

    # --------------------------------------------------------------------------
    # Theme T4: Statistics and Probability
    # --------------------------------------------------------------------------
    "T4.1": {
        "theme": "T4",
        "title": "Descriptive Statistics, Box Plots & Bivariate Regression",
        "hl_only": False,
        "description": "Mean, median, mode, standard deviation, variance, quartiles, IQR, outliers, cumulative frequency, Pearson's r, and linear regression.",
        "keywords": [
            "mean", "median", "mode", "standard deviation", "variance", "quartiles", "interquartile range",
            "iqr", "lower quartile", "upper quartile", "box plot", "box-and-whisker", "cumulative frequency",
            "percentile", "linear correlation", "pearson's product moment", "correlation coefficient",
            "regression line of y on x", "line of best fit", "spearman's rank", "scatter diagram",
            "outliers", "1.5 x iqr", "frequency table", "grouped data"
        ],
        "formulas": [
            r"y\s*=\s*ax\s*\+\s*b", r"y\s*=\s*mx\s*\+\s*c", r"r\s*=\s*[0-9\.\-]+",
            r"s_x", r"\u03c3_x"
        ],
        "weight_boost": 1.2
    },
    "T4.2": {
        "theme": "T4",
        "title": "Probability Laws & Conditional Probability",
        "hl_only": False,
        "description": "Venn diagrams, tree diagrams, sample space, mutually exclusive, independent events, conditional probability, and Bayes' theorem [HL].",
        "keywords": [
            "probability", "venn diagram", "tree diagram", "mutually exclusive", "independent events",
            "conditional probability", "p(a|b)", "p(a and b)", "p(a or b)", "bayes' theorem",
            "bayes theorem", "randomly selected", "without replacement", "with replacement",
            "sample space", "probability that both", "probability that at least one"
        ],
        "formulas": [
            r"P\([A-Z]\s*\|\s*[A-Z]\)", r"P\([A-Z]\s*[\u2229\u222a]\s*[A-Z]\)",
            r"P\([A-Z]'\)"
        ],
        "weight_boost": 1.25
    },
    "T4.3": {
        "theme": "T4",
        "title": "Discrete Random Variables & Binomial/Poisson Distributions",
        "hl_only": False,
        "description": "Probability distribution tables, expected value E(X), Var(X), Binomial distribution B(n, p), and Poisson distribution.",
        "keywords": [
            "discrete random variable", "probability distribution", "expected value", "expectation",
            "e(x)", "var(x)", "variance of x", "binomial distribution", "b(n, p)", "trials",
            "probability of success", "poisson distribution", "mean rate", "occur independently",
            "random variable x has the probability distribution", "sum of probabilities = 1"
        ],
        "formulas": [
            r"E\(X\)", r"Var\(X\)", r"B\(n,\s*p\)", r"Po\(", r"P\(X\s*=\s*x\)"
        ],
        "weight_boost": 1.3
    },
    "T4.4": {
        "theme": "T4",
        "title": "Normal Distribution & Continuous Random Variables",
        "hl_only": False,
        "description": "Normal distribution, z-scores, standardized normal, inverse normal, continuous random variables, PDF f(x), CDF, mean and variance of continuous RV [HL].",
        "keywords": [
            "normal distribution", "normally distributed", "mean mu", "standard deviation sigma",
            "z-score", "standard normal distribution", "inverse normal", "continuous random variable",
            "probability density function", "pdf", "cumulative distribution function", "cdf",
            "integral of f(x) = 1", "median of continuous random variable", "mean of continuous random variable"
        ],
        "formulas": [
            r"N\(.*,\s*.*\)", r"Z\s*=\s*", r"f\(x\)\s*dx\s*=\s*1"
        ],
        "weight_boost": 1.3
    },
    "T4.5": {
        "theme": "T4",
        "title": "Hypothesis Testing & Chi-Squared",
        "hl_only": True,
        "description": "Null and alternative hypotheses, significance level, p-value, critical value, t-test (one-sample, two-sample, paired), chi-squared test of independence, and goodness of fit.",
        "keywords": [
            "hypothesis test", "null hypothesis", "alternative hypothesis", "h0", "h1",
            "significance level", "5% significance level", "1% significance level", "10% significance level",
            "p-value", "critical value", "critical region", "t-test", "two-sample t-test", "paired t-test",
            "chi-squared", "chi-square", "test of independence", "contingency table", "degrees of freedom",
            "goodness of fit", "reject h0", "do not reject h0"
        ],
        "formulas": [
            r"H_0", r"H_1", r"[\u03c7\u03c7]\^?2", r"p\s*<\s*0\.05", r"df\s*="
        ],
        "weight_boost": 1.45
    },

    # --------------------------------------------------------------------------
    # Theme T5: Calculus
    # --------------------------------------------------------------------------
    "T5.1": {
        "theme": "T5",
        "title": "Limits, Differentiation Rules & Tangents/Normals",
        "hl_only": False,
        "description": "Limits, first principles, power, chain, product, quotient rules, derivatives of trig/exp/log, tangent and normal lines, L'Hôpital's rule, and differentiability.",
        "keywords": [
            "derivative", "differentiate", "dy/dx", "f'(x)", "gradient function", "first principles",
            "product rule", "quotient rule", "chain rule", "equation of the tangent", "equation of the normal",
            "tangent to the curve", "normal to the curve", "gradient of the tangent", "gradient of the normal",
            "l'hopital's rule", "l'hopital", "limit as x approaches", "continuous at", "differentiable at"
        ],
        "formulas": [
            r"dy/dx", r"f\'\(x\)", r"lim_\{?x", r"y\s*-\s*y_1\s*=\s*m\(x\s*-\s*x_1\)"
        ],
        "weight_boost": 1.25
    },
    "T5.2": {
        "theme": "T5",
        "title": "Stationary Points, Optimization & Kinematics",
        "hl_only": False,
        "description": "Increasing/decreasing intervals, local maxima/minima, points of inflection, second derivative test, optimization word problems, and kinematics.",
        "keywords": [
            "stationary point", "stationary points", "local maximum", "local minimum", "maximum value",
            "minimum value", "point of inflection", "inflection point", "concavity", "concave up",
            "concave down", "second derivative test", "f''(x)", "increasing function", "decreasing function",
            "optimization", "maximum volume", "minimum surface area", "maximum area", "kinematics",
            "displacement", "velocity", "acceleration", "total distance traveled", "particle is at rest",
            "particle changes direction", "initial velocity", "initial acceleration"
        ],
        "formulas": [
            r"f\'\'\(x\)", r"f\'\(x\)\s*=\s*0", r"v\(t\)\s*=\s*s\'\(t\)", r"a\(t\)\s*=\s*v\'\(t\)",
            r"total distance"
        ],
        "weight_boost": 1.3
    },
    "T5.3": {
        "theme": "T5",
        "title": "Indefinite & Definite Integration & Areas/Volumes",
        "hl_only": False,
        "description": "Anti-derivatives, standard integrals, boundary conditions, definite integrals, area between curves, and volumes of revolution.",
        "keywords": [
            "integral", "integrate", "indefinite integral", "definite integral", "anti-derivative",
            "area enclosed by", "area bounded by", "area of the shaded region", "area between the curves",
            "volume of revolution", "solid of revolution", "rotated through 2pi", "rotated about the x-axis",
            "rotated about the y-axis", "fundamental theorem of calculus", "constant of integration"
        ],
        "formulas": [
            r"\u222b\s*f\(x\)", r"\u03c0\s*\u222b\s*y\^?2", r"\u03c0\s*\u222b\s*x\^?2",
            r"area of the region", r"volume of revolution"
        ],
        "weight_boost": 1.3
    },
    "T5.4": {
        "theme": "T5",
        "title": "Advanced Calculus: Implicit, Related Rates & Integration by Parts/Substitution",
        "hl_only": True,
        "description": "Implicit differentiation, related rates of change, integration by substitution, integration by parts, and trigonometric/partial fractions integration.",
        "keywords": [
            "implicit differentiation", "differentiate implicitly", "dy/dx in terms of x and y",
            "related rates", "rate of increase", "rate of decrease", "rate of change of volume",
            "integration by substitution", "u-substitution", "substitution u =", "integration by parts",
            "integrate by parts", "int u dv", "partial fractions integration", "trigonometric substitution"
        ],
        "formulas": [
            r"\u222b\s*u\s*dv", r"dy/dt\s*=\s*\(?dy/dx\)?", r"rate of change"
        ],
        "weight_boost": 1.45
    },
    "T5.5": {
        "theme": "T5",
        "title": "Differential Equations & Maclaurin Series",
        "hl_only": True,
        "description": "Separable differential equations, slope fields, Euler's method, integrating factors, Maclaurin series expansions, and coupled differential equations.",
        "keywords": [
            "differential equation", "separable variables", "separable differential equation",
            "integrating factor", "euler's method", "slope field", "direction field",
            "maclaurin series", "maclaurin series expansion", "taylor series", "series expansion of",
            "expansion of e^x", "expansion of sin x", "expansion of cos x", "expansion of ln(1+x)",
            "coupled linear differential equations", "phase portrait"
        ],
        "formulas": [
            r"dy/dx\s*=", r"y_\{?n\+1\}?", r"f\(0\)\s*\+\s*x\s*f\'\(0\)",
            r"differential equation"
        ],
        "weight_boost": 1.45
    }
}


# ==============================================================================
# 2. RETIRED SYLLABUS EXCLUSION RULES (LEGACY 2016–2020)
# ==============================================================================

RETIRED_EXCLUSION_RULES = [
    {
        "reason": "Legacy Option: Sets, Relations and Groups retired from 2021+ AA/AI syllabi",
        "paper_match": r"sets_relations_and_groups",
        "keywords": []
    },
    {
        "reason": "Abstract Algebra (Group Theory, Cosets, Lagrange's Theorem) retired from current AA/AI syllabus",
        "paper_match": None,
        "keywords": [
            "abelian group", "cyclic group", "isomorphism", "homomorphism", "subgroup",
            "coset", "lagrange's theorem", "identity element of the group", "inverse element of the group",
            "order of an element", "order of the group", "cayley table", "binary operation on the set g"
        ]
    },
    {
        "reason": "Abstract Sets & Equivalence Relations retired from current AA/AI syllabus",
        "paper_match": None,
        "keywords": [
            "equivalence relation", "equivalence class", "reflexive", "symmetric and transitive",
            "partial order", "partition of the set"
        ]
    },
    {
        "reason": "Legacy Discrete Number Theory & Congruences retired from current AA/AI syllabus",
        "paper_match": None,
        "keywords": [
            "modular arithmetic", "congruence modulo", "congruent modulo", "diophantine equation",
            "linear diophantine", "euclidean algorithm", "fermat's little theorem",
            "chinese remainder theorem", "recurrence relation of second order"
        ]
    },
    {
        "reason": "Legacy Series Convergence Tests (Ratio/Integral/Comparison) retired from current AA/AI syllabus",
        "paper_match": None,
        "keywords": [
            "ratio test for convergence", "ratio test to determine", "integral test for convergence",
            "limit comparison test", "alternating series test", "radius of convergence",
            "interval of convergence", "absolute convergence", "conditional convergence",
            "riemann sum definition"
        ]
    },
    {
        "reason": "Legacy Homogeneous Differential Equations retired from current AA/AI syllabus",
        "paper_match": None,
        "keywords": [
            "homogeneous differential equation", "substitution y = vx to solve the differential"
        ]
    }
]


# ==============================================================================
# 3. CLASSIFICATION DATA STRUCTURE & FUNCTIONS
# ==============================================================================

@dataclass
class ClassificationResult:
    is_excluded: bool
    exclusion_reason: Optional[str]
    primary_subtopics: List[str]
    scores: Dict[str, float]
    is_pure: bool
    is_mixed: bool
    is_intra_theme: bool
    is_cross_theme: bool
    badge: str
    target_themes: List[str]
    target_subtopics: List[str]


def check_exclusion(text: str, paper_info: Optional[Dict[str, Any]] = None) -> Tuple[bool, Optional[str]]:
    """Checks whether a question belongs to a retired legacy syllabus topic."""
    text_lower = text.lower()
    fn_lower = paper_info.get("filename", "").lower() if paper_info else ""

    for rule in RETIRED_EXCLUSION_RULES:
        if rule["paper_match"] and re.search(rule["paper_match"], fn_lower):
            return True, rule["reason"]

        for kw in rule["keywords"]:
            if re.search(r"\b" + re.escape(kw) + r"\b", text_lower):
                return True, f"{rule['reason']} (matched: '{kw}')"

    return False, None


def classify_math_question(
    text: str,
    subpart_texts: Optional[List[str]] = None,
    paper_info: Optional[Dict[str, Any]] = None
) -> ClassificationResult:
    """
    Classifies an IB Mathematics question into Themes T1-T5 and Sub-Topics T1.1-T5.5.
    Evaluates full prompt text, mathematical formulas, and subparts.
    """
    # 1. Check retired syllabus exclusion
    is_excluded, exclusion_reason = check_exclusion(text, paper_info)
    if is_excluded:
        return ClassificationResult(
            is_excluded=True,
            exclusion_reason=exclusion_reason,
            primary_subtopics=[],
            scores={},
            is_pure=False,
            is_mixed=False,
            is_intra_theme=False,
            is_cross_theme=False,
            badge="[EXCLUDED: RETIRED]",
            target_themes=[],
            target_subtopics=[]
        )

    # 2. Score text against all 25 subtopics
    scores: Dict[str, float] = {code: 0.0 for code in SUBTOPICS}
    text_lower = text.lower()

    # Legacy paper option hint
    if paper_info and paper_info.get("filename"):
        fn = paper_info["filename"].lower()
        if "calculus" in fn:
            scores["T5.1"] += 3.0
            scores["T5.3"] += 3.0
            scores["T5.5"] += 4.0
        elif "statistics" in fn:
            scores["T4.1"] += 3.0
            scores["T4.3"] += 3.0
            scores["T4.4"] += 3.0
            scores["T4.5"] += 4.0

    # Match keywords and formulas
    for code, data in SUBTOPICS.items():
        base_weight = data["weight_boost"]
        # Keyword matches
        for kw in data["keywords"]:
            pattern = r"\b" + re.escape(kw) + r"\b"
            matches = len(re.findall(pattern, text_lower))
            if matches > 0:
                word_count = len(kw.split())
                scores[code] += matches * (1.8 * word_count) * base_weight

        # Formula matches
        for f_regex in data["formulas"]:
            if re.search(f_regex, text, re.IGNORECASE):
                scores[code] += 4.0 * base_weight

    # Evaluate subparts if present
    subpart_winners = []
    if subpart_texts:
        for sp_text in subpart_texts:
            sp_scores = {code: 0.0 for code in SUBTOPICS}
            sp_lower = sp_text.lower()
            for code, data in SUBTOPICS.items():
                for kw in data["keywords"]:
                    if re.search(r"\b" + re.escape(kw) + r"\b", sp_lower):
                        sp_scores[code] += 2.0 * data["weight_boost"]
            best_sp = max(sp_scores.items(), key=lambda x: x[1])
            if best_sp[1] >= 2.0:
                subpart_winners.append(best_sp[0])

    # 3. Determine primary subtopics and thresholding
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_code, top_score = sorted_scores[0]

    # No clear syllabus signal: leave it out rather than dumping it into a default topic
    if top_score < 1.5:
        return ClassificationResult(
            is_excluded=True,
            exclusion_reason="Unclassified: no clear syllabus keyword match",
            primary_subtopics=[],
            scores=scores,
            is_pure=False,
            is_mixed=False,
            is_intra_theme=False,
            is_cross_theme=False,
            badge="[UNCLASSIFIED]",
            target_themes=[],
            target_subtopics=[]
        )

    candidates = [top_code]

    # Significant secondary candidates must be >= 2.5 and at least 45% of top score
    secondary_threshold = max(2.5, top_score * 0.45)
    for code, score in sorted_scores[1:]:
        if score >= secondary_threshold and code not in candidates:
            candidates.append(code)

    # Include strong subpart winners (different topics tested in distinct subparts)
    for sw in set(subpart_winners):
        if sw not in candidates and scores[sw] >= 2.0 and scores[sw] >= top_score * 0.40:
            candidates.append(sw)

    # Sort candidates logically by Theme, then subtopic code
    candidates = sorted(candidates, key=lambda c: (SUBTOPICS[c]["theme"], c))

    # Determine Pure vs Mixed
    is_pure = len(candidates) == 1
    is_mixed = len(candidates) > 1

    candidate_themes = list(dict.fromkeys(SUBTOPICS[c]["theme"] for c in candidates))
    is_intra_theme = is_mixed and len(candidate_themes) == 1
    is_cross_theme = is_mixed and len(candidate_themes) > 1

    # Generate badge
    if is_pure:
        badge = f"[Pure: {candidates[0]}]"
    elif is_intra_theme:
        badge = f"[MIXED: {' + '.join(candidates)}]"
    else:
        badge = f"[SYNTHESIS: {' + '.join(candidates)}]"

    target_themes = candidate_themes
    target_subtopics = candidates

    return ClassificationResult(
        is_excluded=False,
        exclusion_reason=None,
        primary_subtopics=candidates,
        scores=scores,
        is_pure=is_pure,
        is_mixed=is_mixed,
        is_intra_theme=is_intra_theme,
        is_cross_theme=is_cross_theme,
        badge=badge,
        target_themes=target_themes,
        target_subtopics=target_subtopics
    )


if __name__ == "__main__":
    # Test classifier on sample stems
    sample_pure = "The first term of an arithmetic sequence is 3 and the common difference is 4. Find the sum of the first 20 terms."
    res1 = classify_math_question(sample_pure)
    print("Test 1 (T1.1):", res1.badge, res1.primary_subtopics, "Themes:", res1.target_themes)

    sample_complex = "Consider the complex number z = 1 + i*sqrt(3). (a) Express z in Euler form. (b) Use De Moivre's theorem to find z^6."
    res2 = classify_math_question(sample_complex)
    print("Test 2 (T1.5):", res2.badge, res2.primary_subtopics, "Themes:", res2.target_themes)

    sample_synthesis = "Let f(x) = x^2 * e^(-x). (a) Find the coordinates of the local maximum. (b) Find the area enclosed by the curve y = f(x), the x-axis and the line x = 2."
    res3 = classify_math_question(sample_synthesis)
    print("Test 3 (Synthesis T5.2 + T5.3):", res3.badge, res3.primary_subtopics, "Themes:", res3.target_themes)

    sample_excluded = "Show that the set G forms an abelian group under the binary operation *. Find the order of the subgroup."
    res4 = classify_math_question(sample_excluded)
    print("Test 4 (Excluded):", res4.is_excluded, res4.exclusion_reason)

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, CheckCircle2, Circle, Clock, ExternalLink,
  BookOpen, HelpCircle, Sparkles, RotateCcw, Filter, ChevronDown, ChevronRight
} from 'lucide-react';
import IBBookletViewerModal from '@/app/components/IBBookletViewerModal';
import IBCommandTermsModal from '@/app/components/IBCommandTermsModal';
import MathView from '@/app/components/MathView';

type ProgressState = 'not_started' | 'in_progress' | 'mastered';

interface SyllabusSubtopic {
  code: string;
  name: string;
  level: 'SL' | 'HL' | 'SL/HL';
  notes: string;
  rvUrl: string;
}

interface SyllabusTopic {
  id: string;
  number: string;
  title: string;
  subject: string;
  rvMainUrl: string;
  subtopics: SyllabusSubtopic[];
}

const SYLLABUS_DATA: Record<string, { name: string; syllabusYear: string; topics: SyllabusTopic[] }> = {
  'math-aa': {
    name: 'Mathematics: Analysis & Approaches (AA)',
    syllabusYear: 'First Assessment 2021',
    topics: [
      {
        id: 'math-aa-1',
        number: 'Topic 1',
        title: 'Number and Algebra',
        subject: 'math-aa',
        rvMainUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/',
        subtopics: [
          { code: '1.1', name: 'Scientific Notation, Arithmetic Operations & Rounding', level: 'SL/HL', notes: 'Express numbers in form $a \\times 10^k$ where $1 \\le a < 10, k \\in \\mathbb{Z}$. Watch significant figures.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.2', name: 'Arithmetic Sequences and Series (General term, Finite sum)', level: 'SL/HL', notes: 'General term: $u_n = u_1 + (n-1)d$; Sum: $S_n = \\frac{n}{2}(2u_1 + (n-1)d) = \\frac{n}{2}(u_1 + u_n)$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.3', name: 'Geometric Sequences and Series (Finite & Infinite Convergent Sum)', level: 'SL/HL', notes: 'General term: $u_n = u_1 r^{n-1}$; Sum: $S_n = \\frac{u_1(1-r^n)}{1-r}$; Convergent sum: $S_\\infty = \\frac{u_1}{1-r}$ iff $|r| < 1$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.4', name: 'Financial Mathematics: Compound Interest, Depreciation, Inflation', level: 'SL/HL', notes: 'Compound interest: $FV = PV\\left(1 + \\frac{r}{100k}\\right)^{kn}$ for $k$ compounding periods per year.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.5', name: 'Laws of Exponents & Logarithms (Log identities & Change of Base)', level: 'SL/HL', notes: '$\\log_a(xy) = \\log_a x + \\log_a y$; $\\log_a(x/y) = \\log_a x - \\log_a y$; Change of base: $\\log_a b = \\frac{\\ln b}{\\ln a}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.6', name: 'Binomial Theorem for Positive Integer Exponents n', level: 'SL/HL', notes: '$(a+b)^n = \\sum_{r=0}^n \\binom{n}{r} a^{n-r} b^r$ where $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$. Pascal’s triangle symmetry.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.7', name: 'Permutations, Combinations & Counting Principles', level: 'HL', notes: 'Arrangements: $^n P_r = \\frac{n!}{(n-r)!}$; Selections: $^n C_r = \\binom{n}{r}$. Watch restrictions and circular arrangements.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.8', name: 'Partial Fractions: Linear Factors & Irreducible Denominators', level: 'HL', notes: 'Decomposition: $\\frac{px+q}{(ax+b)(cx+d)} = \\frac{A}{ax+b} + \\frac{B}{cx+d}$; and repeated factors $\\frac{B}{(ax+b)^2}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.9', name: 'Complex Numbers: Cartesian Form, Conjugate, Mod-Arg & Euler Form', level: 'HL', notes: '$z = a + bi$; Modulus $|z| = \\sqrt{a^2+b^2}$; Argument $\\arg(z) = \\theta$; Polar/Euler: $z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.10', name: 'Powers & Roots of Complex Numbers: De Moivre’s Theorem & Roots of Unity', level: 'HL', notes: 'De Moivre: $[r(\\cos\\theta + i\\sin\\theta)]^n = r^n(\\cos n\\theta + i\\sin n\\theta) = r^n e^{in\\theta}$. $n$-th roots of unity $z^n = 1$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.11', name: 'Proof by Mathematical Induction, Contradiction & Counterexample', level: 'HL', notes: 'Induction 3-step proof: Base step $n=1$, inductive hypothesis assume $n=k$, prove $n=k+1$, conclude formally.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.12', name: 'Extended Binomial Theorem for Any Rational Exponent r (Maclaurin)', level: 'HL', notes: '$(1+x)^r = 1 + rx + \\frac{r(r-1)}{2!}x^2 + \\dots$ valid strictly when $|x| < 1$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' },
          { code: '1.13', name: 'Systems of 3 Linear Equations: Augmented Matrices & Geometric Planes', level: 'HL', notes: 'Row reduction (Gaussian elimination). Geometric meaning: unique intersection point, line of intersection, or inconsistent.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/number-algebra/' }
        ]
      },
      {
        id: 'math-aa-2',
        number: 'Topic 2',
        title: 'Functions',
        subject: 'math-aa',
        rvMainUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/',
        subtopics: [
          { code: '2.1', name: 'Concept of Function, Domain, Range & Vertical Line Test', level: 'SL/HL', notes: 'Function mapping: each element of domain maps to at most one element of range. Vertical line test.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.2', name: 'Linear Functions: Gradient, Intercepts, Parallel & Perpendicular Lines', level: 'SL/HL', notes: 'Gradient $m = \\frac{y_2-y_1}{x_2-x_1}$; Parallel: $m_1 = m_2$; Perpendicular lines: $m_1 m_2 = -1$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.3', name: 'Quadratic Functions: Vertex Form, Axis of Symmetry, Discriminant', level: 'SL/HL', notes: 'Vertex $x = -\\frac{b}{2a}$; Discriminant $\\Delta = b^2 - 4ac$: $\\Delta > 0$ (2 distinct real), $\\Delta = 0$ (equal), $\\Delta < 0$ (none).', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.4', name: 'Composite & Inverse Functions (Bijective Condition, Symmetry across y=x)', level: 'SL/HL', notes: '$(f \\circ g)(x) = f(g(x))$; Inverse $f^{-1}(x)$ exists iff $f(x)$ is one-to-one (passes horizontal line test).', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.5', name: 'Rational Functions & Asymptotes (Horizontal, Vertical, Oblique)', level: 'SL/HL', notes: '$f(x) = \\frac{ax+b}{cx+d}$: Vertical asymptote at $x = -\\frac{d}{c}$, horizontal asymptote at $y = \\frac{a}{c}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.6', name: 'Exponential & Logarithmic Functions (Growth, Decay, Base e)', level: 'SL/HL', notes: '$f(x) = a^x$ and $g(x) = \\log_a x$ are mutual inverses. Horizontal asymptote $y=0$ for $a^x$; vertical $x=0$ for $\\ln x$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.7', name: 'Function Transformations: Translations, Stretches, Reflections', level: 'SL/HL', notes: '$y = a\\,f(b(x-c)) + d$: stretch vertical $a$, horizontal $1/b$, shift right $c$, shift up $d$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.8', name: 'Polynomial Remainder & Factor Theorems', level: 'HL', notes: 'Remainder theorem: $P(c) = R$; Factor theorem: $(x-c)$ is a factor of $P(x)$ iff $P(c) = 0$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.9', name: 'Vieta’s Formulas Relating Roots and Coefficients', level: 'HL', notes: 'For $ax^2+bx+c=0$: $x_1+x_2 = -\\frac{b}{a}$, $x_1 x_2 = \\frac{c}{a}$. Cubic: $\\sum \\alpha = -\\frac{b}{a}$, $\\sum \\alpha\\beta = \\frac{c}{a}$, $\\alpha\\beta\\gamma = -\\frac{d}{a}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.10', name: 'Modulus Functions: Graphing y = |f(x)| and y = f(|x|)', level: 'HL', notes: '$y = |f(x)|$ reflects sections below $x$-axis upwards; $y = f(|x|)$ deletes left of $y$-axis and mirrors right.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.11', name: 'Odd, Even & Periodic Functions (Symmetries & Periodicity)', level: 'HL', notes: 'Even: $f(-x) = f(x)$ ($y$-axis reflection); Odd: $f(-x) = -f(x)$ ($180^\\circ$ rotational symmetry about origin).', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' },
          { code: '2.12', name: 'Solving Polynomial and Rational Inequalities Analytically', level: 'HL', notes: 'Sign tables / test intervals around critical values (roots and denominator zeroes). Never multiply across by unknown sign.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/functions/' }
        ]
      },
      {
        id: 'math-aa-3',
        number: 'Topic 3',
        title: 'Geometry and Trigonometry',
        subject: 'math-aa',
        rvMainUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/',
        subtopics: [
          { code: '3.1', name: '3D Geometry: Coordinate Distance, Midpoint, Surface Area & Volume', level: 'SL/HL', notes: 'Distance: $d = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}$. Cylinder $V = \\pi r^2 h$, Sphere $V = \\frac{4}{3}\\pi r^3$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.2', name: 'Radian Measure, Arc Length, Sector Area & Segment Area', level: 'SL/HL', notes: 'Arc length: $s = r\\theta$; Sector area: $A = \\frac{1}{2}r^2\\theta$; Segment area: $A = \\frac{1}{2}r^2(\\theta - \\sin\\theta)$ (radians).', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.3', name: 'Sine & Cosine Rules, Triangle Area & The Ambiguous Case (SSA)', level: 'SL/HL', notes: '$\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$; $c^2 = a^2+b^2-2ab\\cos C$; Area $= \\frac{1}{2}ab\\sin C$. Ambiguous case occurs when $b\\sin A < a < b$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.4', name: 'Unit Circle, Exact Trig Values & Basic Pythagorean Identity', level: 'SL/HL', notes: '$\\sin^2\\theta + \\cos^2\\theta = 1$; $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$. Exact values for $0, \\frac{\\pi}{6}, \\frac{\\pi}{4}, \\frac{\\pi}{3}, \\frac{\\pi}{2}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.5', name: 'Double Angle & Compound Angle Identities', level: 'SL/HL', notes: '$\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$; $\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta$; $\\tan(2\\theta) = \\frac{2\\tan\\theta}{1-\\tan^2\\theta}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.6', name: 'Trigonometric Functions: Graphs, Amplitude, Period & Phase Shift', level: 'SL/HL', notes: '$f(x) = A\\sin(B(x-C)) + D$: Amplitude $|A|$, period $\\frac{2\\pi}{B}$, phase shift $C$, vertical shift $D$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.7', name: 'Reciprocal Trig Functions: Secant, Cosecant, Cotangent & Identities', level: 'HL', notes: '$\\sec\\theta = \\frac{1}{\\cos\\theta}$, $\\csc\\theta = \\frac{1}{\\sin\\theta}$, $\\cot\\theta = \\frac{1}{\\tan\\theta}$; $1+\\tan^2\\theta = \\sec^2\\theta$, $1+\\cot^2\\theta = \\csc^2\\theta$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.8', name: 'Inverse Trigonometric Functions: Arcsin, Arccos, Arctan & Domains', level: 'HL', notes: '$\\arcsin x \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$; $\\arccos x \\in [0, \\pi]$; $\\arctan x \\in (-\\frac{\\pi}{2}, \\frac{\\pi}{2})$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.9', name: '2D & 3D Vectors: Magnitude, Unit Vectors, Dot Product & Angles', level: 'HL', notes: 'Magnitude $|\\mathbf{v}| = \\sqrt{v_1^2+v_2^2+v_3^2}$; Dot product: $\\mathbf{v} \\cdot \\mathbf{w} = |\\mathbf{v}||\\mathbf{w}|\\cos\\theta$; Perpendicular iff $\\mathbf{v} \\cdot \\mathbf{w} = 0$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.10', name: 'Vector Cross Product: Normal Vectors, Parallelogram & Triangle Areas', level: 'HL', notes: 'Cross product $\\mathbf{v} \\times \\mathbf{w}$ is perpendicular to both. Area of parallelogram $= |\\mathbf{v} \\times \\mathbf{w}|$; Triangle $= \\frac{1}{2}|\\mathbf{v} \\times \\mathbf{w}|$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.11', name: '3D Lines: Vector & Parametric Equations, Intersecting/Parallel/Skew Lines', level: 'HL', notes: 'Line: $\\mathbf{r} = \\mathbf{a} + \\lambda\\mathbf{b}$. Test if parallel (collinear directions), intersecting (single point), or skew (non-coplanar).', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' },
          { code: '3.12', name: '3D Planes: Vector, Scalar Product & Cartesian Equations, Intersections', level: 'HL', notes: 'Plane: $\\mathbf{r} \\cdot \\mathbf{n} = \\mathbf{a} \\cdot \\mathbf{n} \\implies ax + by + cz = d$. Normal vector $\\mathbf{n} = \\begin{pmatrix} a \\\\ b \\\\ c \\end{pmatrix}$. Line-plane angle: $\\sin\\theta = \\frac{|\\mathbf{b}\\cdot\\mathbf{n}|}{|\\mathbf{b}||\\mathbf{n}|}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/' }
        ]
      },
      {
        id: 'math-aa-4',
        number: 'Topic 4',
        title: 'Statistics and Probability',
        subject: 'math-aa',
        rvMainUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/',
        subtopics: [
          { code: '4.1', name: 'Data Presentation: Frequency, Histograms, Box-and-Whisker Plots', level: 'SL/HL', notes: 'Quartiles $Q_1, Q_2 (\\text{median}), Q_3$; Outliers fence: strictly outside $[Q_1 - 1.5\\times\\text{IQR}, Q_3 + 1.5\\times\\text{IQR}]$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.2', name: 'Measures of Central Tendency & Dispersion (Mean, Variance, Std Dev)', level: 'SL/HL', notes: 'Mean $\\bar{x} = \\frac{\\sum x}{n}$; Standard deviation $\\sigma = \\sqrt{\\frac{\\sum(x-\\bar{x})^2}{n}}$. Effect of linear transformations $ax+b$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.3', name: 'Bivariate Correlation & Linear Regression (Pearson’s r, Best-Fit Line)', level: 'SL/HL', notes: 'Pearson’s $r \\in [-1, 1]$. Line of best fit $y - \\bar{y} = m(x - \\bar{x})$ passes through centroid $(\\bar{x}, \\bar{y})$. Interpolation vs extrapolation.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.4', name: 'Probability Rules: Independent, Mutually Exclusive, Conditional P(A|B)', level: 'SL/HL', notes: '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$; Conditional: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$; Independent iff $P(A \\cap B) = P(A)P(B)$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.5', name: 'Discrete Random Variables: Expected Value E(X) & Variance Var(X)', level: 'SL/HL', notes: '$\\sum P(X=x) = 1$; Expectation: $E(X) = \\sum x P(X=x)$; Variance: $\\text{Var}(X) = E(X^2) - [E(X)]^2$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.6', name: 'Binomial Distribution X ~ B(n, p): Probabilities, Mean & Variance', level: 'SL/HL', notes: '$P(X=r) = \\binom{n}{r} p^r (1-p)^{n-r}$; Mean $E(X) = np$; Variance $\\text{Var}(X) = np(1-p)$. GDC binompdf / binomcdf.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.7', name: 'Normal Distribution X ~ N(mu, sigma^2): Z-Scores & Inverse Normal', level: 'SL/HL', notes: 'Bell curve symmetry about $\\mu$; Standard normal: $Z = \\frac{X-\\mu}{\\sigma} \\sim N(0, 1)$. GDC normcdf / invNorm.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.8', name: 'Bayes’ Theorem for Conditional Probabilities with Partitions', level: 'HL', notes: 'Posterior probability: $P(B_i|A) = \\frac{P(B_i)P(A|B_i)}{\\sum_{j} P(B_j)P(A|B_j)}$. Solved with comprehensive probability trees.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' },
          { code: '4.9', name: 'Continuous Random Variables: Probability Density Function (PDF) & CDF', level: 'HL', notes: '$\\int_{-\\infty}^\\infty f(x) dx = 1$; $P(a \\le X \\le b) = \\int_a^b f(x) dx$; Expectation: $E(X) = \\int_{-\\infty}^\\infty x f(x) dx$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/statistics-and-probability/' }
        ]
      },
      {
        id: 'math-aa-5',
        number: 'Topic 5',
        title: 'Calculus',
        subject: 'math-aa',
        rvMainUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/',
        subtopics: [
          { code: '5.1', name: 'Derivative from First Principles & Basic Differentiation Rules', level: 'SL/HL', notes: 'First principles: $f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$. Power rule: $\\frac{d}{dx}[x^n] = n x^{n-1}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.2', name: 'Chain Rule, Product Rule, Quotient Rule & Tangents/Normals', level: 'SL/HL', notes: 'Chain: $\\frac{dy}{dx} = \\frac{dy}{du}\\frac{du}{dx}$; Product: $(uv)\' = u\'v + uv\'$; Normal gradient: $m_{\\text{normal}} = -\\frac{1}{m_{\\text{tangent}}}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.3', name: 'Second Derivatives, Concavity, Inflection Points & Optimization', level: 'SL/HL', notes: '$f\'\'(x) > 0$ concave up (min); $f\'\'(x) < 0$ concave down (max). Inflection requires $f\'\'=0$ with concavity sign change.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.4', name: 'Indefinite & Definite Integrals, Fundamental Theorem of Calculus', level: 'SL/HL', notes: '$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$; Area between curves: $A = \\int_a^b |f(x) - g(x)| dx$. Fundamental theorem: $\\int_a^b f(x) dx = F(b) - F(a)$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.5', name: 'Kinematics: Displacement s(t), Velocity v(t), Acceleration a(t)', level: 'SL/HL', notes: '$v(t) = s\'(t)$, $a(t) = v\'(t) = s\'\'(t)$; Displacement $= \\int v(t) dt$; Total distance $= \\int |v(t)| dt$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.6', name: 'Derivatives of Reciprocal & Inverse Trig Functions', level: 'HL', notes: '$\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1-x^2}}$; $\\frac{d}{dx}[\\arccos x] = -\\frac{1}{\\sqrt{1-x^2}}$; $\\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.7', name: 'Implicit Differentiation & Related Rates of Change', level: 'HL', notes: 'Implicit: differentiate $F(x, y) = c$ with respect to $x$ using chain rule $\\frac{d}{dx}[y^n] = n y^{n-1}\\frac{dy}{dx}$. Related rates: link $\\frac{dV}{dt}, \\frac{dr}{dt}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.8', name: 'L’Hôpital’s Rule for Indeterminate Limits (0/0 and inf/inf)', level: 'HL', notes: '$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f\'(x)}{g\'(x)}$ iff direct substitution yields $\\frac{0}{0}$ or $\\frac{\\pm\\infty}{\\pm\\infty}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.9', name: 'Integration by Substitution & Integration by Parts', level: 'HL', notes: 'Parts: $\\int u \\frac{dv}{dx} dx = uv - \\int v \\frac{du}{dx} dx$. LIATE rule (Log, Inverse trig, Algebraic, Trig, Exponential).', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.10', name: 'Volumes of Revolution About x-Axis and y-Axis', level: 'HL', notes: 'Rotation about $x$-axis: $V = \\pi \\int_a^b [f(x)]^2 dx$; Rotation about $y$-axis: $V = \\pi \\int_c^d [g(y)]^2 dy$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.11', name: 'Differential Equations: Separation of Variables & Integrating Factor', level: 'HL', notes: 'Separation: $\\int \\frac{1}{h(y)} dy = \\int g(x) dx$; Integrating factor for $\\frac{dy}{dx} + P(x)y = Q(x)$ is $I(x) = e^{\\int P(x) dx}$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' },
          { code: '5.12', name: 'Maclaurin and Taylor Series Expansions', level: 'HL', notes: 'Maclaurin: $f(x) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(0)}{n!} x^n$; Booklet series for $e^x, \\sin x, \\cos x, \\ln(1+x), (1+x)^p$.', rvUrl: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/' }
        ]
      }
    ]
  },
  'physics': {
    name: 'Physics (New 2025/2026 Syllabus)',
    syllabusYear: 'First Assessment 2025',
    topics: [
      {
        id: 'phys-A',
        number: 'Theme A',
        title: 'Space, Time and Motion',
        subject: 'physics',
        rvMainUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/',
        subtopics: [
          { code: 'A.1', name: 'Kinematics: 1D and 2D Projectile Motion under Gravity', level: 'SL/HL', notes: 'Decouple horizontal (constant velocity $v_x = u\\cos\\theta$) and vertical ($a_y = -9.81\\text{ m s}^{-2}$). SUVAT equations.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'A.2', name: 'Forces and Momentum: Newton\'s Laws, Impulse & Conservation', level: 'SL/HL', notes: 'Impulse: $J = F\\Delta t = \\Delta p = m v - m u$ (area under $F-t$ curve). Momentum conserved in all isolated collisions.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'A.3', name: 'Work, Energy & Power: Mechanical Efficiency & Elastic PE', level: 'SL/HL', notes: 'Hooke’s law $F = -kx$; Elastic energy $E_p = \\frac{1}{2}kx^2$; Power $P = Fv = \\frac{W}{t}$; Efficiency $\\eta = \\frac{P_{\\text{out}}}{P_{\\text{in}}}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'A.4', name: 'Rigid Body Mechanics: Torque, Rotational Inertia & Angular Momentum', level: 'HL', notes: 'Rotational analog: $\\tau = I\\alpha$; Angular momentum $L = I\\omega$; Rotational KE $= \\frac{1}{2}I\\omega^2$. Rolling without slipping.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'A.5', name: 'Galilean and Special Relativity: Lorentz Transformations & Spacetime', level: 'HL', notes: 'Lorentz factor $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$; Time dilation $\\Delta t = \\gamma \\Delta t_0$; Length contraction $L = L_0 / \\gamma$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' }
        ]
      },
      {
        id: 'phys-B',
        number: 'Theme B',
        title: 'The Particulate Nature of Matter',
        subject: 'physics',
        rvMainUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/',
        subtopics: [
          { code: 'B.1', name: 'Thermal Energy Transfers: Conduction, Convection & Radiation', level: 'SL/HL', notes: 'Stefan-Boltzmann law: $P = e\\sigma A T^4$; Wien’s displacement law: $\\lambda_{\\max} T = 2.90 \\times 10^{-3}\\text{ m K}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'B.2', name: 'Greenhouse Effect, Planetary Energy Balance & Albedo', level: 'SL/HL', notes: 'Solar constant $S = 1.36 \\times 10^3\\text{ W m}^{-2}$. Albedo $\\alpha = \\frac{\\text{scattered power}}{\\text{total incident power}}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'B.3', name: 'Gas Laws & Kinetic Model: Ideal Gas Equation pV = nRT = N k_B T', level: 'SL/HL', notes: 'Mean translational kinetic energy per molecule: $\\bar{E}_k = \\frac{3}{2} k_B T$. Internal energy $U = \\frac{3}{2} N k_B T$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'B.4', name: 'Thermodynamics: First Law, Heat Engines, Carnot Cycle & Entropy', level: 'HL', notes: '$Q = \\Delta U + W$; Carnot maximum efficiency $\\eta = 1 - \\frac{T_C}{T_H}$; Second law: total entropy $\\Delta S \\ge 0$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' }
        ]
      },
      {
        id: 'phys-C',
        number: 'Theme C',
        title: 'Wave Behaviour',
        subject: 'physics',
        rvMainUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/',
        subtopics: [
          { code: 'C.1', name: 'Simple Harmonic Motion (SHM) Kinematics & Energy Relations', level: 'SL/HL', notes: 'Defining equation: $a = -\\omega^2 x$; Period $T = \\frac{2\\pi}{\\omega}$; Velocity $v = \\pm\\omega\\sqrt{x_0^2 - x^2}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'C.2', name: 'Wave Model: Traveling Waves, Transverse vs Longitudinal, Snell’s Law', level: 'SL/HL', notes: 'Wave speed $v = f\\lambda$; Snell’s law: $\\frac{n_1}{n_2} = \\frac{\\sin\\theta_2}{\\sin\\theta_1} = \\frac{v_2}{v_1}$; Critical angle $\\sin\\theta_c = \\frac{1}{n}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'C.3', name: 'Wave Phenomena: Superposition, Interference & Standing Waves', level: 'SL/HL', notes: 'Path difference constructive $n\\lambda$, destructive $(n + \\frac{1}{2})\\lambda$. Standing wave nodes ($x=0$) and antinodes.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'C.4', name: 'Standing Waves, Resonance & Damping', level: 'HL', notes: 'Light damping, critical damping, overdamping. Resonance occurs when driving frequency matches natural frequency $f_0$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'C.5', name: 'Doppler Effect for Sound and Light Waves (Redshift & Hubble\'s Law)', level: 'HL', notes: 'Moving source: $f\' = f\\left(\\frac{v}{v \\pm u_s}\\right)$; Light frequency shift: $\\frac{\\Delta f}{f} \\approx \\frac{v}{c}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' }
        ]
      },
      {
        id: 'phys-D',
        number: 'Theme D',
        title: 'Fields',
        subject: 'physics',
        rvMainUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/',
        subtopics: [
          { code: 'D.1', name: 'Gravitational Fields: Newton’s Universal Gravitation & Orbital Motion', level: 'SL/HL', notes: 'Gravitational force: $F = G\\frac{M m}{r^2}$; Gravitational potential: $V_g = -\\frac{GM}{r}$; Escape velocity $v_{\\text{esc}} = \\sqrt{\\frac{2GM}{r}}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'D.2', name: 'Electric and Magnetic Fields: Coulomb’s Law, Field Strength & Lorentz Force', level: 'SL/HL', notes: 'Coulomb’s law $F = k\\frac{q_1 q_2}{r^2}$; Magnetic force on moving charge: $F = q v B \\sin\\theta$; on current wire: $F = B I L \\sin\\theta$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'D.3', name: 'Electromagnetic Induction: Faraday’s Law, Lenz’s Law & Generators', level: 'HL', notes: 'Induced EMF: $\\varepsilon = -N \\frac{d\\Phi}{dt}$ where magnetic flux $\\Phi = B A \\cos\\theta$. Lenz\'s law opposes change in flux.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' }
        ]
      },
      {
        id: 'phys-E',
        number: 'Theme E',
        title: 'Nuclear and Quantum Physics',
        subject: 'physics',
        rvMainUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/',
        subtopics: [
          { code: 'E.1', name: 'Atomic Structure: Rutherford Scattering & Discrete Emission Spectra', level: 'SL/HL', notes: 'Photon energy: $E = hf = \\frac{hc}{\\lambda}$. Spectral emission series prove discrete atomic electron energy levels.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'E.2', name: 'Radioactive Decay: Half-Life, Mass Defect & Nuclear Binding Energy', level: 'SL/HL', notes: 'Decay law: $N = N_0 e^{-\\lambda t}$; Half-life: $T_{1/2} = \\frac{\\ln 2}{\\lambda}$; Mass-energy equivalence: $E = \\Delta m c^2$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' },
          { code: 'E.3', name: 'Photoelectric Effect & Wave-Particle Duality (de Broglie Wavelength)', level: 'HL', notes: 'Einstein photoelectric equation: $E_{\\max} = hf - \\Phi = e V_{\\text{stop}}$. de Broglie matter wavelength $\\lambda = \\frac{h}{p}$.', rvUrl: 'https://www.revisionvillage.com/ib-physics/questionbank/' }
        ]
      }
    ]
  },
  'chemistry': {
    name: 'Chemistry (New 2025/2026 Syllabus)',
    syllabusYear: 'First Assessment 2025',
    topics: [
      {
        id: 'chem-S1',
        number: 'Structure 1',
        title: 'Models of the Particulate Nature of Matter',
        subject: 'chemistry',
        rvMainUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
        subtopics: [
          { code: 'S1.1', name: 'Stoichiometric Relationships: Molar Mass, Avogadro, Empirical Formulae', level: 'SL/HL', notes: 'Mole concept: $n = \\frac{m}{M} = \\frac{N}{N_A}$. Ideal gas molar volume at STP $= 22.7\\text{ dm}^3\\text{ mol}^{-1}$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'S1.2', name: 'Atomic Structure: Isotopes, Mass Spectrometry & Configurations', level: 'SL/HL', notes: 'Aufbau principle, Hund’s rule, Pauli exclusion. Stability exceptions: $\\text{Cr: }[\\text{Ar}] 4s^1 3d^5$ and $\\text{Cu: }[\\text{Ar}] 4s^1 3d^{10}$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'S1.3', name: 'Successive Ionization Energies & Convergence Limits', level: 'HL', notes: 'Large jumps in successive IE identify transition between electron shells. Convergence frequency $\\Delta E = h\\nu$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' }
        ]
      },
      {
        id: 'chem-S2',
        number: 'Structure 2',
        title: 'Models of Chemical Bonding and Structure',
        subject: 'chemistry',
        rvMainUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
        subtopics: [
          { code: 'S2.1', name: 'Ionic Bonding, Lattice Energy Trends & Giant Structures', level: 'SL/HL', notes: 'Ionic character increases with electronegativity difference $\\Delta\\chi > 1.8$. High melting point, conduct when molten/aqueous.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'S2.2', name: 'Covalent Bonding: Lewis Structures, VSEPR Geometry & Polarity', level: 'SL/HL', notes: 'VSEPR repulsion: lone pair-lone pair > lone pair-bond pair > bond pair-bond pair. Bond angles: $109.5^\\circ, 107^\\circ, 104.5^\\circ$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'S2.3', name: 'Intermolecular Forces: London Dispersion, Dipole-Dipole & H-Bonds', level: 'SL/HL', notes: 'Hydrogen bonding occurs strictly between H atom and highly electronegative small atoms N, O, or F.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'S2.4', name: 'Formal Charge, Expanded Octets & Resonance Delocalization', level: 'HL', notes: 'Formal charge: $FC = V - N - \\frac{B}{2}$. Lowest FC and negative FC on most electronegative atoms preferred.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'S2.5', name: 'Hybridization: sp3, sp2, sp, Sigma & Pi Bond Overlaps', level: 'HL', notes: 'Single bond $= 1\\sigma$; double bond $= 1\\sigma + 1\\pi$; triple bond $= 1\\sigma + 2\\pi$. $\\sigma$ is axial, $\\pi$ is lateral.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' }
        ]
      },
      {
        id: 'chem-R1',
        number: 'Reactivity 1',
        title: 'What Drives Chemical Reactions (Energetics & Kinetics)',
        subject: 'chemistry',
        rvMainUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
        subtopics: [
          { code: 'R1.1', name: 'Hess’s Law, Standard Enthalpies of Formation and Combustion', level: 'SL/HL', notes: '$\\Delta H^\\circ = \\sum \\Delta H_f^\\circ(\\text{products}) - \\sum \\Delta H_f^\\circ(\\text{reactants})$. Bond enthalpy: $\\Delta H = \\sum D_{\\text{broken}} - \\sum D_{\\text{formed}}$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R1.2', name: 'Entropy (S) and Gibbs Free Energy (Delta G) for Spontaneity', level: 'HL', notes: 'Gibbs equation: $\\Delta G = \\Delta H - T\\Delta S$. Spontaneous reaction strictly when $\\Delta G < 0$. At equilibrium, $\\Delta G = 0$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R1.3', name: 'Born-Haber Cycles for Ionic Compounds & Lattice Enthalpy', level: 'HL', notes: 'Lattice enthalpy $\\Delta H_{\\text{lat}}$ calculation combining atomization, ionization energy, electron affinity, and formation.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R1.4', name: 'Collision Theory, Maxwell-Boltzmann Distribution & Catalysis', level: 'SL/HL', notes: 'Catalysts provide an alternative reaction pathway with lower activation energy ($E_a$) without altering $\\Delta H$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R1.5', name: 'Rate Expressions, Reaction Orders & Arrhenius Equation', level: 'HL', notes: '$\\text{Rate} = k [A]^m [B]^n$; Arrhenius plot $\\ln k = -\\frac{E_a}{R}\\left(\\frac{1}{T}\\right) + \\ln A$ has gradient $-\\frac{E_a}{R}$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' }
        ]
      },
      {
        id: 'chem-R2',
        number: 'Reactivity 2',
        title: 'Chemical Equilibrium, Acids and Bases & Redox',
        subject: 'chemistry',
        rvMainUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
        subtopics: [
          { code: 'R2.1', name: 'Chemical Equilibrium: Equilibrium Law (Kc) & Le Chatelier', level: 'SL/HL', notes: '$K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$. Only temperature alters $K_c$. Pressure/concentration shift equilibrium position.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R2.2', name: 'Acids and Bases: Brønsted-Lowry, pH Scale & Kw', level: 'SL/HL', notes: '$\\text{pH} = -\\log[H^+]$; $K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}$ at $298\\text{ K}$. Strong vs weak acid dissociation.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R2.3', name: 'Acid-Base Calculations: Ka, Kb, Buffer Solutions & Titrations', level: 'HL', notes: 'Buffer equation: $\\text{pH} = \\text{p}K_a + \\log\\left(\\frac{[A^-]}{[HA]}\\right)$. Equivalence points and indicator selection ($\\text{pH} = \\text{p}K_{\\text{In}} \\pm 1$).', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R2.4', name: 'Redox Reactions, Standard Electrode Potentials & Voltaic Cells', level: 'SL/HL', notes: '$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$. Spontaneous when $E^\\circ_{\\text{cell}} > 0$; $\\Delta G^\\circ = -nFE^\\circ_{\\text{cell}}$.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' }
        ]
      },
      {
        id: 'chem-R3',
        number: 'Reactivity 3',
        title: 'Mechanisms of Organic Chemical Transformations',
        subject: 'chemistry',
        rvMainUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
        subtopics: [
          { code: 'R3.1', name: 'IUPAC Nomenclature, Homologous Series & Functional Groups', level: 'SL/HL', notes: 'Alkanes, alkenes, alcohols, halogenoalkanes, aldehydes, ketones, carboxylic acids, esters, amides, nitriles.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R3.2', name: 'Nucleophilic Substitution: SN1 vs SN2 Mechanisms & Stereochemistry', level: 'HL', notes: '$S_N1$ (tertiary, 2 steps, carbocation, racemization) vs $S_N2$ (primary, 1 step, backside attack, Walden inversion).', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' },
          { code: 'R3.3', name: 'Electrophilic Addition to Alkenes & Markovnikov’s Rule', level: 'HL', notes: 'Addition of $H-X$ follows Markovnikov’s rule: $H$ bonds to carbon with more hydrogens via more stable carbocation.', rvUrl: 'https://www.revisionvillage.com/ib-chemistry/questionbank/' }
        ]
      }
    ]
  },
  'biology': {
    name: 'Biology (New 2025/2026 Syllabus)',
    syllabusYear: 'First Assessment 2025',
    topics: [
      {
        id: 'bio-A',
        number: 'Theme A',
        title: 'Unity and Diversity',
        subject: 'biology',
        rvMainUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/',
        subtopics: [
          { code: 'A.1', name: 'Cell Theory, Surface Area-to-Volume Ratio & Ultrastructure', level: 'SL/HL', notes: 'Cell size limitations: smaller cells maintain high SA:V ratio for diffusive transport. Organelle compartmentalization.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'A.2', name: 'Viruses: Structural Diversity, Lytic & Lysogenic Cycles', level: 'SL/HL', notes: 'Viral capsids, non-enveloped vs enveloped, reverse transcriptase in retroviruses (HIV), temperate phages.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'A.3', name: 'Origin of Cells & Endosymbiotic Theory Evidence', level: 'SL/HL', notes: 'Mitochondria/chloroplast evidence: 70S bacterial ribosomes, circular naked DNA, binary fission, double membranes.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' }
        ]
      },
      {
        id: 'bio-B',
        number: 'Theme B',
        title: 'Molecular Biology',
        subject: 'biology',
        rvMainUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/',
        subtopics: [
          { code: 'B.1', name: 'Carbohydrates, Lipids & Phospholipid Bilayer Membranes', level: 'SL/HL', notes: 'Fluid mosaic model: amphipathic phospholipids, cholesterol regulation of membrane fluidity, channel/carrier proteins.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'B.2', name: 'Proteins: 4 Levels of Folding & Enzyme Kinetics', level: 'SL/HL', notes: 'Primary (peptide), secondary ($\\alpha$-helix, $\\beta$-sheet), tertiary (R-group bonds), quaternary. Competitive vs non-competitive inhibition.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'B.3', name: 'Cellular Respiration: Glycolysis, Krebs Cycle & Chemiosmosis', level: 'HL', notes: 'Proton accumulation in mitochondrial intermembrane space powers ATP synthase. Oxygen is terminal electron acceptor.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'B.4', name: 'Photosynthesis: Light-Dependent Reactions & Calvin Cycle', level: 'HL', notes: 'Photolysis of water in thylakoid lumen; ATP and NADPH drive RuBisCO carboxylation of RuBP in stroma.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' }
        ]
      },
      {
        id: 'bio-C',
        number: 'Theme C',
        title: 'Genetics',
        subject: 'biology',
        rvMainUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/',
        subtopics: [
          { code: 'C.1', name: 'DNA Replication: Semi-Conservative Mechanism & Enzymes', level: 'SL/HL', notes: 'Helicase unwinds, DNA polymerase III synthesizes $5\' \\to 3\'$, RNA primase, DNA polymerase I replaces primers, ligase joins Okazaki fragments.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'C.2', name: 'Transcription, RNA Splicing & Translation Mechanism', level: 'HL', notes: 'Spliceosomes remove introns; alternative splicing allows one gene to code for multiple polypeptide isoforms.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'C.3', name: 'Inheritance: Monohybrid/Dihybrid Crosses & Autosomal Linkage', level: 'SL/HL', notes: 'Mendelian 9:3:3:1 ratio; deviations indicate gene linkage on same chromosome requiring recombinant frequency calculation.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' }
        ]
      },
      {
        id: 'bio-D',
        number: 'Theme D',
        title: 'Ecology and Evolution',
        subject: 'biology',
        rvMainUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/',
        subtopics: [
          { code: 'D.1', name: 'Trophic Levels, Energy Pyramids & 10% Transfer Efficiency', level: 'SL/HL', notes: 'Energy loss at each trophic level via metabolic heat (second law of thermodynamics), unconsumed biomass, excretion.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'D.2', name: 'Natural Selection, Speciation & Antibiotic Resistance', level: 'SL/HL', notes: 'Evolution defined as cumulative change in allele frequencies of a population over generations. Directional/stabilizing/disruptive.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' },
          { code: 'D.3', name: 'Hardy-Weinberg Principle & Population Genetics', level: 'HL', notes: 'Hardy-Weinberg equilibrium: $p^2 + 2pq + q^2 = 1$ and $p + q = 1$. Assumptions: large population, random mating, no selection/mutation.', rvUrl: 'https://www.revisionvillage.com/ib-biology/questionbank/' }
        ]
      }
    ]
  }
};

const STORAGE_KEY = 'ib_syllabus_progress_v1';

export default function SyllabusTrackerPage() {
  const [activeSubject, setActiveSubject] = useState<string>('math-aa');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'SL' | 'HL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ProgressState>('ALL');
  const [search, setSearch] = useState<string>('');
  const [showBookletModal, setShowBookletModal] = useState(false);
  const [showCommandTermsModal, setShowCommandTermsModal] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressState>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgressMap(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load syllabus progress', e);
    }
    setIsLoaded(true);
  }, []);

  // Save progress to localStorage whenever it changes
  const updateProgress = (code: string, nextState: ProgressState) => {
    const updated = { ...progressMap, [code]: nextState };
    setProgressMap(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save syllabus progress', e);
    }
  };

  const cycleProgress = (code: string) => {
    const current = progressMap[code] || 'not_started';
    let next: ProgressState = 'in_progress';
    if (current === 'not_started') next = 'in_progress';
    else if (current === 'in_progress') next = 'mastered';
    else if (current === 'mastered') next = 'not_started';
    updateProgress(code, next);
  };

  const currentSubjectData = SYLLABUS_DATA[activeSubject];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!currentSubjectData) return { total: 0, mastered: 0, inProgress: 0, notStarted: 0, percent: 0 };
    let total = 0;
    let mastered = 0;
    let inProgress = 0;

    currentSubjectData.topics.forEach(t => {
      t.subtopics.forEach(st => {
        total++;
        const state = progressMap[st.code] || 'not_started';
        if (state === 'mastered') mastered++;
        else if (state === 'in_progress') inProgress++;
      });
    });

    const notStarted = total - mastered - inProgress;
    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, inProgress, notStarted, percent };
  }, [currentSubjectData, progressMap]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    if (!currentSubjectData) return [];
    return currentSubjectData.topics.map(topic => {
      const filteredSubtopics = topic.subtopics.filter(st => {
        if (filterLevel !== 'ALL') {
          if (filterLevel === 'SL' && st.level === 'HL') return false;
          if (filterLevel === 'HL' && st.level === 'SL') return false;
        }

        const state = progressMap[st.code] || 'not_started';
        if (filterStatus !== 'ALL' && state !== filterStatus) return false;

        const q = search.toLowerCase().trim();
        if (q) {
          return (
            st.code.toLowerCase().includes(q) ||
            st.name.toLowerCase().includes(q) ||
            st.notes.toLowerCase().includes(q)
          );
        }
        return true;
      });

      return {
        ...topic,
        subtopics: filteredSubtopics
      };
    }).filter(topic => topic.subtopics.length > 0);
  }, [currentSubjectData, filterLevel, filterStatus, search, progressMap]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem 3rem' }}>
      {/* Header Panel */}
      <div
        className="panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          background: 'var(--panel-light)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="tech-label" style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}>
              [SYLLABUS_PROGRESS_TRACKER]
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              PERSISTENT LOCAL STORAGE ENGINE • {currentSubjectData?.syllabusYear}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>
            IB Syllabus Master Checklist
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, maxWidth: '780px' }}>
            Track topic mastery across the official IBDP curriculum. Every syllabus point includes examiner trap notes and direct links to practice free exam-style questions on Revision Village.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setShowCommandTermsModal(true)}
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: 'var(--panel)' }}
          >
            <Sparkles size={14} style={{ color: 'var(--rust)' }} /> Command Terms
          </button>
          <button
            onClick={() => setShowBookletModal(true)}
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: 'var(--panel)' }}
          >
            <BookOpen size={14} style={{ color: 'var(--rust)' }} /> Formula Booklets
          </button>
          <Link
            href="/"
            className="filter-btn active"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Subject Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'math-aa', label: 'Mathematics AA (SL/HL)' },
          { id: 'physics', label: 'Physics (New 2025)' },
          { id: 'chemistry', label: 'Chemistry (New 2025)' },
          { id: 'biology', label: 'Biology (New 2025)' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubject(sub.id)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: activeSubject === sub.id ? '1.5px solid var(--rust)' : '1px solid var(--border)',
              background: activeSubject === sub.id ? 'var(--rust)' : 'var(--panel-light)',
              color: activeSubject === sub.id ? '#fff' : 'var(--ink)',
              transition: 'all 0.15s ease'
            }}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Progress Metric Card */}
      <div
        className="panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Overall Syllabus Mastery
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
              {stats.percent}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--panel-light)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div
              style={{
                width: `${stats.percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #b84a39, #059669)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#059669', display: 'block' }}>{stats.mastered}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Mastered</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#d97706', display: 'block' }}>{stats.inProgress}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>In Progress</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--muted)', display: 'block' }}>{stats.notStarted}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Not Started</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', display: 'block' }}>{stats.total}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Points</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ marginBottom: '1.5rem', padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search syllabus learning objectives, formulas, or concepts..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.45rem 1rem 0.45rem 2.4rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Level filter */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Level:</span>
            {(['ALL', 'SL', 'HL'] as const).map(lvl => (
              <button
                key={lvl}
                className={`filter-btn ${filterLevel === lvl ? 'active' : ''}`}
                onClick={() => setFilterLevel(lvl)}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Status:</span>
            {(['ALL', 'not_started', 'in_progress', 'mastered'] as const).map(st => (
              <button
                key={st}
                className={`filter-btn ${filterStatus === st ? 'active' : ''}`}
                onClick={() => setFilterStatus(st)}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                {st === 'ALL' ? 'All Status' : st === 'not_started' ? 'Not Started' : st === 'in_progress' ? 'In Progress' : 'Mastered'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Syllabus Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredTopics.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            <p>No syllabus topics match the selected filters or search terms.</p>
          </div>
        ) : (
          filteredTopics.map(topic => (
            <div
              key={topic.id}
              className="panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {/* Topic Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="tech-label" style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}>
                    {topic.number}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', margin: 0 }}>
                    {topic.title}
                  </h2>
                </div>

                <a
                  href={topic.rvMainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="filter-btn active"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem'
                  }}
                >
                  <ExternalLink size={12} /> Practice All {topic.number} on Revision Village ↗
                </a>
              </div>

              {/* Subtopic Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topic.subtopics.map(st => {
                  const state = progressMap[st.code] || 'not_started';
                  const isMastered = state === 'mastered';
                  const isInProgress = state === 'in_progress';

                  return (
                    <div
                      key={st.code}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '6px',
                        border: isMastered ? '1px solid rgba(5, 150, 105, 0.3)' : isInProgress ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid var(--border)',
                        background: isMastered ? 'rgba(5, 150, 105, 0.04)' : isInProgress ? 'rgba(217, 119, 6, 0.04)' : 'var(--panel-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.85rem'
                      }}
                    >
                      {/* Left: Code, Name, Examiner Notes */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
                        <button
                          onClick={() => cycleProgress(st.code)}
                          title="Click to toggle status: Not Started -> In Progress -> Mastered"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '2px'
                          }}
                        >
                          {isMastered ? (
                            <CheckCircle2 size={20} style={{ color: '#059669' }} />
                          ) : isInProgress ? (
                            <Clock size={20} style={{ color: '#d97706' }} />
                          ) : (
                            <Circle size={20} style={{ color: 'var(--muted)', opacity: 0.6 }} />
                          )}
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--rust)' }}>
                              [{st.code}]
                            </span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)' }}>
                              {st.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                background: st.level === 'HL' ? 'var(--rust)' : 'rgba(0,0,0,0.06)',
                                color: st.level === 'HL' ? '#fff' : 'var(--muted)'
                              }}
                            >
                              {st.level}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '0.2rem' }}>
                            <span style={{ flexShrink: 0 }}>💡</span>
                            <div style={{ flex: 1 }}>
                              <MathView content={st.notes} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <button
                          onClick={() => cycleProgress(st.code)}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            background: isMastered ? '#059669' : isInProgress ? '#d97706' : 'var(--panel)',
                            color: isMastered || isInProgress ? '#fff' : 'var(--muted)'
                          }}
                        >
                          {isMastered ? '✓ Mastered' : isInProgress ? '⏳ In Progress' : '○ Not Started'}
                        </button>

                        <a
                          href={st.rvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="filter-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            textDecoration: 'none',
                            fontSize: '0.72rem',
                            padding: '0.25rem 0.65rem',
                            background: 'var(--panel)'
                          }}
                        >
                          <ExternalLink size={11} /> RV Practice ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booklets Modal */}
      <IBBookletViewerModal
        isOpen={showBookletModal}
        onClose={() => setShowBookletModal(false)}
      />

      {/* Command Terms Modal */}
      <IBCommandTermsModal
        isOpen={showCommandTermsModal}
        onClose={() => setShowCommandTermsModal(false)}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Calculator,
  ExternalLink,
  Sparkles,
  Search,
  BookOpen,
  Sliders,
  Maximize2,
} from 'lucide-react';
import MathView from './MathView';
import DesmosVisualPreview from './DesmosVisualPreview';

interface DesmosShortcut {
  id: string;
  category: string;
  title: string;
  satQuestionTrigger: string;
  desmosSyntax: string;
  howToUse: string;
  proTip: string;
}

const DESMOS_SHORTCUTS: DesmosShortcut[] = [
  {
    id: 'system-intersections',
    category: 'Algebra & Systems',
    title: 'Instant Intersection of Linear & Non-Linear Equations',
    satQuestionTrigger: '"What is the value of x in the system of equations?", or "How many solutions exist?"',
    desmosSyntax: 'y = 3x - 5\ny = x^2 - 4x + 5',
    howToUse: 'Type both equations on separate lines in Desmos. Gray dots will appear at every intersection. Click the dot to read the exact (x, y) coordinates.',
    proTip: 'Works for circles, exponentials, and quadratics. Zero algebraic substitution or quadratic formulas required.',
  },
  {
    id: 'linear-regression',
    category: 'Data & Statistics',
    title: 'Linear Table Regression (Find Slope & Intercept)',
    satQuestionTrigger: 'Given a table of (x, y) coordinates or word problem with rates, find the linear model.',
    desmosSyntax: 'y_1 \\sim m x_1 + b',
    howToUse: 'Click "+" in Desmos -> select "table". Enter your x and y points. On line 2, type: y1 ~ m*x1 + b (use tilde ~).',
    proTip: 'Desmos immediately outputs m (slope), b (y-intercept), and r (correlation coefficient).',
  },
  {
    id: 'quadratic-vertex-regression',
    category: 'Advanced Math',
    title: 'Quadratic Vertex Form Regression',
    satQuestionTrigger: '"What is the maximum or minimum value?", or finding (h, k) vertex from points.',
    desmosSyntax: 'y_1 \\sim a(x_1 - h)^2 + k',
    howToUse: 'Enter points in table (x1, y1). Type the vertex regression model. Desmos outputs h (x-coord of vertex) and k (maximum/minimum value).',
    proTip: 'If a < 0 the parabola opens downwards and k is the maximum. If a > 0 it opens upwards and k is the minimum.',
  },
  {
    id: 'constant-slider-search',
    category: 'Algebra & Systems',
    title: 'Slider Method for Constant "k" or "c"',
    satQuestionTrigger: '"For what value of constant k does the equation have no solutions / infinite solutions?"',
    desmosSyntax: '3x + 12 = kx + 4',
    howToUse: 'Type the equation with variable k. Click "add slider: k". Slide k until lines are parallel (slope matches -> 0 solutions) or overlap.',
    proTip: 'For infinite solutions, both slopes and y-intercepts must match identically.',
  },
  {
    id: 'circle-expanded-form',
    category: 'Geometry',
    title: 'Expanded Circle Equations (No Completing the Square)',
    satQuestionTrigger: 'Given x^2 + y^2 - 6x + 8y - 25 = 0, find radius or center coordinates.',
    desmosSyntax: 'x^2 + y^2 - 6x + 8y - 25 = 0',
    howToUse: 'Desmos graphs expanded circle equations directly without converting! Type it exactly as written. Click the perimeter and center.',
    proTip: 'To verify radius, find center (h, k) then check distance to the rightmost point on the circle: r = x_{max} - h.',
  },
  {
    id: 'exponential-regression',
    category: 'Advanced Math',
    title: 'Exponential Growth & Decay Regression',
    satQuestionTrigger: 'Given population growth or depreciation table, find the percentage rate.',
    desmosSyntax: 'y_1 \\sim a \\cdot b^{x_1}',
    howToUse: 'Enter data in table. Type y1 ~ a * b^x1. Desmos yields a (initial value) and b (growth factor = 1 + r or decay = 1 - r).',
    proTip: 'If b = 1.08, growth rate is 8%. If b = 0.88, decay rate is 12%.',
  },
  {
    id: 'equivalent-expression-test',
    category: 'Algebra & Systems',
    title: 'Equivalent Expression Overlap Test',
    satQuestionTrigger: '"Which of the following is equivalent to (2x^2 - 8)/(x - 2)?"',
    desmosSyntax: 'f(x) = \\frac{2x^2 - 8}{x - 2}\ng(x) = 2x + 4',
    howToUse: 'Type the original expression on line 1. Type choice A on line 2. If the two graphs lie exactly on top of each other, it is the correct answer!',
    proTip: 'Turn choice curves on and off by clicking the colored wavy circle icon next to each line.',
  },
  {
    id: 'degree-mode-warning',
    category: 'Geometry',
    title: 'Degree Mode Switch (Crucial Setup)',
    satQuestionTrigger: 'All geometry questions with right triangles, angles, sine, cosine, tangent.',
    desmosSyntax: '\\sin(30) = 0.5 \\quad (\\text{in Degree mode})',
    howToUse: 'Click the Wrench (Settings) icon in the top right of Desmos. At the very bottom, click "Degrees" so it is highlighted.',
    proTip: 'Desmos defaults to Radians! If sin(30) yields -0.988, your calculator is in Radians. Switch to Degrees to get 0.5.',
  },
  {
    id: 'inequality-shading',
    category: 'Algebra & Systems',
    title: 'Inequality Feasible Region & Maximum Value',
    satQuestionTrigger: '"Which point (x, y) satisfies the system of inequalities?"',
    desmosSyntax: 'y \\ge 2x - 3 \\{x > 0\\}\ny < -x + 6',
    howToUse: 'Type <=, >=, <, or >. Desmos shades the solution region automatically. Points inside the overlapping colored region are valid.',
    proTip: 'Test specific coordinate points by typing (3, 2) on a new line and see if it lands in the overlap.',
  },
  {
    id: 'percentage-direct-eval',
    category: 'Problem Solving',
    title: 'Direct Percentage & Fraction Calculations',
    satQuestionTrigger: '"If a price is increased by 15% then discounted by 20%..."',
    desmosSyntax: 'x = 100 \\cdot (1 + 0.15) \\cdot (1 - 0.20)',
    howToUse: 'Use multiplier chaining directly on a blank line. Desmos evaluates standard arithmetic with proper order of operations.',
    proTip: 'For "x is what percentage of y", simply type (x / y) * 100.',
  },
];

export default function DesmosMasterKeyModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['all', 'Algebra & Systems', 'Advanced Math', 'Data & Statistics', 'Geometry', 'Problem Solving'];

  const filteredShortcuts = DESMOS_SHORTCUTS.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.howToUse.toLowerCase().includes(search.toLowerCase()) ||
      s.satQuestionTrigger.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--panel-light, #ffffff)',
          color: 'var(--ink)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(28,28,30,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calculator size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
                Desmos Master Key: 10 Essential Digital SAT Shortcuts
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                Official College Board Desmos Strategies & Regression Syntax
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="https://www.desmos.com/calculator"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                color: 'var(--ink)',
                textDecoration: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--bg, #fff)',
                fontWeight: 600,
              }}
            >
              Launch Desmos <ExternalLink size={12} />
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)',
                padding: '0.3rem',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            padding: '0.9rem 1.75rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--panel-light, #fff)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-btn ${selectedCategory === c ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c)}
                style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}
              >
                {c === 'all' ? 'All Shortcuts (10)' : c}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search shortcut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredShortcuts.map((s, idx) => (
            <div
              key={s.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '1.25rem',
                background: 'var(--panel-light, #fafafa)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        background: 'rgba(184, 74, 57, 0.08)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {s.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      #{idx + 1}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.4rem 0' }}>{s.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(s.id, s.desmosSyntax)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: copiedId === s.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg, #fff)',
                    color: copiedId === s.id ? '#059669' : 'var(--ink)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedId === s.id ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Syntax
                    </>
                  )}
                </button>
              </div>

              {/* SAT Trigger */}
              <div style={{ fontSize: '0.84rem', color: 'var(--ink)', opacity: 0.85, marginBottom: '0.75rem' }}>
                <strong>SAT Question Trigger:</strong> <em>{s.satQuestionTrigger}</em>
              </div>

              {/* Syntax Display Box */}
              <div
                style={{
                  background: '#1c1917',
                  color: '#f5f5f4',
                  borderRadius: '4px',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <code>{s.desmosSyntax}</code>
              </div>

              {/* Visual Desmos Calculator Screenshot Mockup */}
              <DesmosVisualPreview id={s.id} />

              {/* How to use */}
              <div style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                {s.howToUse}
              </div>

              {/* Pro Tip Box */}
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(234, 179, 8, 0.08)',
                  borderRadius: '4px',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  fontSize: '0.8rem',
                  color: '#92400e',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <strong>PRO TIP:</strong> {s.proTip}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border)',
            background: 'rgba(28,28,30,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--muted)',
          }}
        >
          <span>Note: Desmos is fully embedded in both Math modules on the official Digital SAT.</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.45rem 1.1rem',
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

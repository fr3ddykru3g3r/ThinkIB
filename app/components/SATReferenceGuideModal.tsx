'use client';

import React, { useState } from 'react';
import { X, BookOpen, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
import MathView from './MathView';

interface SATReferenceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'math' | 'english';
}

export default function SATReferenceGuideModal({
  isOpen,
  onClose,
  defaultTab = 'math',
}: SATReferenceGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'math' | 'english'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--panel-light, #ffffff)',
          color: 'var(--ink)',
          border: '1px solid var(--border)',
          maxWidth: '880px',
          width: '100%',
          maxHeight: '88vh',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <span className="section-label" style={{ margin: 0 }}>
              REFERENCE SPECIFICATION
            </span>
            <h2 style={{ fontSize: '1.4rem', margin: '0.2rem 0 0' }}>
              SAT Formulae & English Conventions
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(128,128,128,0.1)', padding: '3px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('math')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeTab === 'math' ? 'var(--bg, #fff)' : 'transparent',
                  color: activeTab === 'math' ? 'var(--ink)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'math' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                Math Formulae
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('english')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeTab === 'english' ? 'var(--bg, #fff)' : 'transparent',
                  color: activeTab === 'english' ? 'var(--ink)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'english' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                English Convention Rules
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.3rem' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, fontSize: '0.92rem', lineHeight: '1.65' }}>
          {/* ==================================================== */}
          {/* TAB 1: MATH FORMULAE */}
          {/* ==================================================== */}
          {activeTab === 'math' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* 1. Geometry & Trigonometry */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  1. Geometry & Coordinate Formulas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Circle:</strong><br />
                    Area: <MathView content="$A = \pi r^2$" /><br />
                    Circumference: <MathView content="$C = 2\pi r$" /><br />
                    Equation: <MathView content="$(x-h)^2 + (y-k)^2 = r^2$" /><br />
                    Arc Length: <MathView content="$s = r\theta$" /> (radians)<br />
                    Sector Area: <MathView content="$A = \frac{1}{2}r^2\theta$" />
                  </div>
                  <div>
                    <strong>Triangles & Polygons:</strong><br />
                    Area: <MathView content="$A = \frac{1}{2}bh$" /><br />
                    Pythagorean Theorem: <MathView content="$a^2 + b^2 = c^2$" /><br />
                    Sum of Interior Angles: <MathView content="$(n - 2) \times 180^\circ$" />
                  </div>
                  <div>
                    <strong>Special Right Triangles:</strong><br />
                    <MathView content="$30^\circ - 60^\circ - 90^\circ$" />: sides <MathView content="$x, x\sqrt{3}, 2x$" /><br />
                    <MathView content="$45^\circ - 45^\circ - 90^\circ$" />: sides <MathView content="$s, s, s\sqrt{2}$" />
                  </div>
                  <div>
                    <strong>3D Volumes:</strong><br />
                    Rectangular Prism: <MathView content="$V = \ell w h$" /><br />
                    Cylinder: <MathView content="$V = \pi r^2 h$" /><br />
                    Sphere: <MathView content="$V = \frac{4}{3}\pi r^3$" /><br />
                    Cone: <MathView content="$V = \frac{1}{3}\pi r^2 h$" />
                  </div>
                </div>
              </div>

              {/* 2. Linear Equations & Coordinate Geometry */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  2. Linear Equations & Lines
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Slope:</strong> <MathView content="$m = \frac{y_2 - y_1}{x_2 - x_1}$" /><br />
                    <strong>Slope-Intercept Form:</strong> <MathView content="$y = mx + b$" /><br />
                    <strong>Point-Slope Form:</strong> <MathView content="$y - y_1 = m(x - x_1)$" />
                  </div>
                  <div>
                    <strong>Parallel Lines:</strong> <MathView content="$m_1 = m_2$" /><br />
                    <strong>Perpendicular Lines:</strong> <MathView content="$m_1 \cdot m_2 = -1$" /> (negative reciprocal)<br />
                    <strong>Midpoint:</strong> <MathView content="$\left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)$" /><br />
                    <strong>Distance:</strong> <MathView content="$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$" />
                  </div>
                </div>
              </div>

              {/* 3. Quadratics, Parabolas & Discriminant */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  3. Quadratics & Advanced Math
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Standard Form:</strong> <MathView content="$y = ax^2 + bx + c$" /><br />
                    <strong>Quadratic Formula:</strong><br />
                    <MathView content="$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$" />
                  </div>
                  <div>
                    <strong>Vertex Form:</strong> <MathView content="$y = a(x - h)^2 + k$" /> (Vertex at <MathView content="$(h, k)$" />)<br />
                    <strong>X-Coordinate of Vertex:</strong> <MathView content="$h = -\frac{b}{2a}$" /><br />
                    <strong>Sum of Roots:</strong> <MathView content="$x_1 + x_2 = -\frac{b}{a}$" /><br />
                    <strong>Product of Roots:</strong> <MathView content="$x_1 x_2 = \frac{c}{a}$" />
                  </div>
                  <div>
                    <strong>The Discriminant (<MathView content="$\Delta = b^2 - 4ac$" />):</strong><br />
                    • <MathView content="$\Delta > 0$" />: 2 distinct real solutions (2 x-intercepts)<br />
                    • <MathView content="$\Delta = 0$" />: Exactly 1 real solution (tangent to x-axis)<br />
                    • <MathView content="$\Delta < 0$" />: 0 real solutions (no x-intercepts)
                  </div>
                </div>
              </div>

              {/* 4. Exponentials, Trigonometry & Statistics */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  4. Exponential, Trigonometry & Statistics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Exponential Growth & Decay:</strong><br />
                    <MathView content="$y = a(1 + r)^t$" /> (growth)<br />
                    <MathView content="$y = a(1 - r)^t$" /> (decay)<br />
                    Half-life / Doubling: <MathView content="$y = a \cdot b^{t/k}$" />
                  </div>
                  <div>
                    <strong>Trigonometric Ratios:</strong><br />
                    <MathView content="$\sin\theta = \frac{\text{Opposite}}{\text{Hypotenuse}}$" /><br />
                    <MathView content="$\cos\theta = \frac{\text{Adjacent}}{\text{Hypotenuse}}$" /><br />
                    <MathView content="$\tan\theta = \frac{\text{Opposite}}{\text{Adjacent}}$" /><br />
                    <strong>Cofunction Identity:</strong> <MathView content="$\sin(x) = \cos(90^\circ - x)$" />
                  </div>
                  <div>
                    <strong>Statistics & Probability:</strong><br />
                    Mean: <MathView content="$\bar{x} = \frac{\sum x}{n}$" /><br />
                    Probability: <MathView content="$P = \frac{\text{favorable}}{\text{total}}$" /><br />
                    Percent Change: <MathView content="$\frac{\text{New} - \text{Old}}{\text{Old}} \times 100\%$" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: ENGLISH CONVENTIONS RULES */}
          {/* ==================================================== */}
          {activeTab === 'english' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* 1. Clause Boundaries */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  1. Clause Boundaries & Sentence Structure
                </h3>
                <p style={{ marginBottom: '0.8rem' }}>
                  An <strong>Independent Clause (IC)</strong> can stand alone as a sentence. A <strong>Dependent Clause (DC)</strong> cannot.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>4 Legal Ways to Connect Two ICs:</strong><br />
                    1. Period: <MathView content="$\text{IC. IC.}$" /><br />
                    2. Semicolon: <MathView content="$\text{IC; IC.}$" /><br />
                    3. Comma + FANBOYS: <MathView content="$\text{IC, and IC.}$" /> (for, and, nor, but, or, yet, so)<br />
                    4. Colon or Dash: <MathView content="$\text{IC: IC.}$" /> or <MathView content="$\text{IC - IC.}$" />
                  </div>
                  <div>
                    <strong>The Comma Splice Error:</strong><br />
                    Connecting two independent clauses with only a comma is ALWAYS wrong:<br />
                    <span style={{ color: '#dc2626' }}>✗ He studied hard, he passed the exam.</span><br />
                    <span style={{ color: '#059669' }}>✓ He studied hard, and he passed the exam.</span><br />
                    <span style={{ color: '#059669' }}>✓ He studied hard; he passed the exam.</span>
                  </div>
                </div>
              </div>

              {/* 2. Punctuation Rules: Colons, Semicolons, Dashes */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  2. Punctuation: Colons, Semicolons & Dashes
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>The Colon Rule:</strong><br />
                    Everything BEFORE a colon must be an independent clause.<br />
                    <span style={{ color: '#059669' }}>✓ She brought three essentials: water, paper, and a pen.</span><br />
                    <span style={{ color: '#dc2626' }}>✗ She brought: water, paper, and a pen.</span> (never after a verb)
                  </div>
                  <div>
                    <strong>Semicolons:</strong><br />
                    Mechanically identical to periods on the Digital SAT. If two choices differ only by a period vs. a semicolon, both are almost always incorrect.
                  </div>
                  <div>
                    <strong>Single Dash vs. Double Dashes:</strong><br />
                    • Single dash works like a colon (introduces an explanation or dramatic pause).<br />
                    • Double dashes (<MathView content="$ - \dots - $" />) or double commas (<MathView content="$, \dots ,$" />) set off non-essential descriptive clauses.
                  </div>
                </div>
              </div>

              {/* 3. Agreement & Modifiers */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  3. Agreement & Dangling Modifiers
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Subject-Verb Agreement:</strong><br />
                    Eliminate prepositional phrases to locate the true subject:<br />
                    <em>The collection of ancient Greek artifacts [is/are] valuable.</em> &rarr; <strong>is</strong> (subject is <em>collection</em>, singular).
                  </div>
                  <div>
                    <strong>Dangling Modifiers:</strong><br />
                    An introductory modifying phrase must immediately precede the noun doing the action:<br />
                    <span style={{ color: '#dc2626' }}>✗ Running through the rain, my umbrella broke.</span><br />
                    <span style={{ color: '#059669' }}>✓ Running through the rain, I broke my umbrella.</span>
                  </div>
                  <div>
                    <strong>Apostrophes & Pronouns:</strong><br />
                    • <em>its</em> = possessive (The cat licked its paw)<br />
                    • <em>it's</em> = contraction (It is / it has)<br />
                    • <em>their</em> = possessive; <em>they're</em> = they are; <em>there</em> = location.
                  </div>
                </div>
              </div>

              {/* 4. Rhetorical Transitions */}
              <div className="panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>
                  4. Rhetorical Transitions Classification
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>Contrast</strong><br />
                    However<br />
                    Nevertheless<br />
                    Conversely<br />
                    Regardless<br />
                    In contrast
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>Cause & Effect</strong><br />
                    Therefore<br />
                    Consequently<br />
                    As a result<br />
                    Thus<br />
                    Accordingly
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>Addition</strong><br />
                    Furthermore<br />
                    Moreover<br />
                    In addition<br />
                    Additionally<br />
                    Indeed
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>Exemplification</strong><br />
                    For example<br />
                    For instance<br />
                    Specifically<br />
                    To illustrate<br />
                    In particular
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

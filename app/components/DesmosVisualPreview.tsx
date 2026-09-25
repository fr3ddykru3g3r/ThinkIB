'use client';

import React from 'react';

interface DesmosVisualPreviewProps {
  id: string;
}

export default function DesmosVisualPreview({ id }: DesmosVisualPreviewProps) {
  switch (id) {
    case 'system-intersections':
      return (
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={circleButtons}>
              <span style={{ ...circle, background: '#ef4444' }} />
              <span style={{ ...circle, background: '#eab308' }} />
              <span style={{ ...circle, background: '#22c55e' }} />
            </div>
            <span style={titleStyle}>DESMOS GRAPHING SIMULATION • TWO-LINE INTERSECTION</span>
          </div>
          <div style={bodyStyle}>
            {/* Left: Desmos Expression list */}
            <div style={sidebarStyle}>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#2d70b3' }}>1</span>
                <span style={exprCode}>y = 3x - 5</span>
              </div>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#c74440' }}>2</span>
                <span style={exprCode}>y = x^2 - 4x + 5</span>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(45, 112, 179, 0.08)', borderRadius: '4px', fontSize: '0.72rem', color: '#1e3a8a', fontFamily: 'var(--font-mono)' }}>
                ✓ 2 Intersections Detected
              </div>
            </div>
            {/* Right: Graph Canvas Visualization */}
            <div style={graphStyle}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                {/* Grid Lines */}
                <line x1="0" y1="80" x2="320" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="160" y1="0" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="0" y1="40" x2="320" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="120" x2="320" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="80" y1="0" x2="80" y2="160" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="240" y1="0" x2="240" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                {/* Line: y = 3x - 5 */}
                <line x1="120" y1="150" x2="240" y2="20" stroke="#2d70b3" strokeWidth="2.5" />

                {/* Parabola: y = x^2 - 4x + 5 */}
                <path d="M 120 140 Q 185 85 245 10" fill="none" stroke="#c74440" strokeWidth="2.5" />

                {/* Intersection Gray Dot 1 at (2, 1) */}
                <circle cx="185" cy="85" r="5.5" fill="#475569" stroke="#fff" strokeWidth="1.5" />
                <rect x="195" y="70" width="55" height="20" rx="3" fill="#1e293b" opacity="0.9" />
                <text x="222" y="84" fill="#fff" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  (2, 1)
                </text>

                {/* Intersection Gray Dot 2 at (5, 10) */}
                <circle cx="230" cy="32" r="5" fill="#475569" stroke="#fff" strokeWidth="1.5" />
                <rect x="238" y="18" width="60" height="20" rx="3" fill="#1e293b" opacity="0.9" />
                <text x="268" y="32" fill="#fff" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  (5, 10)
                </text>
              </svg>
            </div>
          </div>
        </div>
      );

    case 'linear-regression':
      return (
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={circleButtons}>
              <span style={{ ...circle, background: '#ef4444' }} />
              <span style={{ ...circle, background: '#eab308' }} />
              <span style={{ ...circle, background: '#22c55e' }} />
            </div>
            <span style={titleStyle}>DESMOS REGRESSION SIMULATION • TABLE TO EQUATION</span>
          </div>
          <div style={bodyStyle}>
            <div style={sidebarStyle}>
              {/* Table */}
              <div style={{ display: 'flex', gap: '4px', fontSize: '0.72rem', fontFamily: 'monospace', marginBottom: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <strong>x1</strong><br />2<br />4<br />6
                </div>
                <div style={{ width: '1px', background: '#cbd5e1' }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <strong>y1</strong><br />5<br />11<br />17
                </div>
              </div>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#388c46' }}>2</span>
                <span style={exprCode}>y_1 ~ m x_1 + b</span>
              </div>
              <div style={{ padding: '0.4rem 0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'monospace', color: '#0f172a' }}>
                <strong>PARAMETERS:</strong><br />
                m = <strong style={{ color: '#059669' }}>3</strong> &nbsp; b = <strong style={{ color: '#059669' }}>-1</strong><br />
                r = 1 (Perfect Correlation)
              </div>
            </div>
            <div style={graphStyle}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                <line x1="0" y1="130" x2="320" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="60" y1="0" x2="60" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Line */}
                <line x1="60" y1="135" x2="280" y2="15" stroke="#388c46" strokeWidth="2.5" />
                {/* Points */}
                <circle cx="100" cy="115" r="4.5" fill="#388c46" />
                <text x="110" y="118" fill="#334155" fontSize="9" fontFamily="monospace">(2, 5)</text>
                <circle cx="160" cy="75" r="4.5" fill="#388c46" />
                <text x="170" y="78" fill="#334155" fontSize="9" fontFamily="monospace">(4, 11)</text>
                <circle cx="220" cy="35" r="4.5" fill="#388c46" />
                <text x="230" y="38" fill="#334155" fontSize="9" fontFamily="monospace">(6, 17)</text>
              </svg>
            </div>
          </div>
        </div>
      );

    case 'quadratic-vertex-regression':
      return (
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={circleButtons}>
              <span style={{ ...circle, background: '#ef4444' }} />
              <span style={{ ...circle, background: '#eab308' }} />
              <span style={{ ...circle, background: '#22c55e' }} />
            </div>
            <span style={titleStyle}>DESMOS PARABOLA APEX • INSTANT MAXIMUM/MINIMUM</span>
          </div>
          <div style={bodyStyle}>
            <div style={sidebarStyle}>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#6042a6' }}>1</span>
                <span style={exprCode}>y = -(x - 3)^2 + 8</span>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '4px', fontSize: '0.72rem', color: '#581c87', fontFamily: 'monospace' }}>
                Vertex Apex: (3, 8)<br />
                • Max Value = <strong>8</strong><br />
                • Occurs at x = <strong>3</strong>
              </div>
            </div>
            <div style={graphStyle}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                <line x1="0" y1="120" x2="320" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="100" y1="0" x2="100" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Parabola opening downwards */}
                <path d="M 80 150 Q 180 -10 280 150" fill="none" stroke="#6042a6" strokeWidth="2.5" />
                {/* Apex dot */}
                <circle cx="180" cy="40" r="5.5" fill="#475569" stroke="#fff" strokeWidth="1.5" />
                <rect x="190" y="28" width="85" height="22" rx="3" fill="#1e293b" opacity="0.9" />
                <text x="232" y="43" fill="#fff" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Apex (3, 8)
                </text>
              </svg>
            </div>
          </div>
        </div>
      );

    case 'circle-expanded-form':
      return (
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={circleButtons}>
              <span style={{ ...circle, background: '#ef4444' }} />
              <span style={{ ...circle, background: '#eab308' }} />
              <span style={{ ...circle, background: '#22c55e' }} />
            </div>
            <span style={titleStyle}>EXPANDED CIRCLE GRAPH • CENTER & RADIUS READOUT</span>
          </div>
          <div style={bodyStyle}>
            <div style={sidebarStyle}>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#0284c7' }}>1</span>
                <span style={exprCode}>x^2+y^2-6x+8y=0</span>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.45rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px', fontSize: '0.72rem', color: '#0369a1', fontFamily: 'monospace' }}>
                Center: <strong>(3, -4)</strong><br />
                Radius r: <strong>5</strong><br />
                (Zero algebra needed)
              </div>
            </div>
            <div style={graphStyle}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                <line x1="0" y1="50" x2="320" y2="50" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="120" y1="0" x2="120" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Circle */}
                <circle cx="180" cy="110" r="45" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                {/* Center dot */}
                <circle cx="180" cy="110" r="4" fill="#0284c7" />
                <rect x="190" y="100" width="70" height="20" rx="3" fill="#1e293b" opacity="0.9" />
                <text x="225" y="114" fill="#fff" fontSize="9" fontFamily="monospace" textAnchor="middle">(3, -4)</text>
                {/* Radius line */}
                <line x1="180" y1="110" x2="225" y2="110" stroke="#0284c7" strokeDasharray="3 3" strokeWidth="1.5" />
                <text x="200" y="104" fill="#0284c7" fontSize="9" fontWeight="bold">r = 5</text>
              </svg>
            </div>
          </div>
        </div>
      );

    case 'constant-slider-search':
      return (
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={circleButtons}>
              <span style={{ ...circle, background: '#ef4444' }} />
              <span style={{ ...circle, background: '#eab308' }} />
              <span style={{ ...circle, background: '#22c55e' }} />
            </div>
            <span style={titleStyle}>DYNAMIC SLIDER • MATCHING COEFFICIENT &quot;k&quot;</span>
          </div>
          <div style={bodyStyle}>
            <div style={sidebarStyle}>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#c74440' }}>1</span>
                <span style={exprCode}>y = 2x + 7</span>
              </div>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#2d70b3' }}>2</span>
                <span style={exprCode}>y = kx - 3</span>
              </div>
              <div style={{ marginTop: '0.4rem', padding: '0.45rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                  <span>k = <strong>2</strong></span>
                  <span style={{ color: '#059669' }}>Parallel (No Sol)</span>
                </div>
                {/* Fake slider */}
                <div style={{ width: '100%', height: '4px', background: '#cbd5e1', borderRadius: '2px', position: 'relative', marginTop: '6px' }}>
                  <div style={{ position: 'absolute', left: '60%', top: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: '#2d70b3' }} />
                </div>
              </div>
            </div>
            <div style={graphStyle}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                <line x1="0" y1="80" x2="320" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="160" y1="0" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Parallel lines */}
                <line x1="60" y1="160" x2="220" y2="0" stroke="#c74440" strokeWidth="2" />
                <line x1="100" y1="160" x2="260" y2="0" stroke="#2d70b3" strokeWidth="2" strokeDasharray="4 2" />
                <text x="180" y="30" fill="#0f172a" fontSize="9" fontFamily="monospace" fontWeight="bold">Parallel Slopes (k = 2)</text>
              </svg>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={circleButtons}>
              <span style={{ ...circle, background: '#ef4444' }} />
              <span style={{ ...circle, background: '#eab308' }} />
              <span style={{ ...circle, background: '#22c55e' }} />
            </div>
            <span style={titleStyle}>DESMOS GRAPHING ENGINE • VISUAL VERIFICATION</span>
          </div>
          <div style={bodyStyle}>
            <div style={sidebarStyle}>
              <div style={exprRow}>
                <span style={{ ...colorBadge, background: '#2d70b3' }}>1</span>
                <span style={exprCode}>y = f(x)</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#475569', fontFamily: 'monospace' }}>
                Click axes or gray dots to inspect coordinates.
              </div>
            </div>
            <div style={graphStyle}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                <line x1="0" y1="80" x2="320" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="160" y1="0" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                <path d="M 40 140 Q 160 0 280 140" fill="none" stroke="#2d70b3" strokeWidth="2.5" />
                <circle cx="160" cy="70" r="5" fill="#475569" stroke="#fff" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      );
  }
}

// UI Mockup Styles
const containerStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  marginBottom: '0.85rem',
  marginTop: '0.5rem',
};

const headerStyle: React.CSSProperties = {
  background: '#f1f5f9',
  padding: '6px 10px',
  borderBottom: '1px solid #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const circleButtons: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
};

const circle: React.CSSProperties = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  display: 'inline-block',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#475569',
};

const bodyStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '170px 1fr',
  minHeight: '120px',
  background: 'var(--surface)',
};

const sidebarStyle: React.CSSProperties = {
  borderRight: '1px solid #e2e8f0',
  padding: '8px',
  background: 'var(--surface)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const exprRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '3px 0',
};

const colorBadge: React.CSSProperties = {
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '9px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const exprCode: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.76rem',
  color: '#0f172a',
  whiteSpace: 'nowrap',
};

const graphStyle: React.CSSProperties = {
  background: '#f8fafc',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
};

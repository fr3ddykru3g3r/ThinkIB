'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Search,
  ExternalLink,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import MathView from './MathView';

type BookletSubject = 'math-aa' | 'math-ai' | 'physics' | 'chemistry';

interface IBFormulaItem {
  topic: string;
  name: string;
  formula: string;
  notes: string;
}

const PHYSICS_FORMULAS: IBFormulaItem[] = [
  // Mechanics
  { topic: 'Theme A: Space, Time & Motion', name: 'Uniform Acceleration (SUVAT)', formula: 'v = u + at \\quad s = ut + \\frac{1}{2}at^2 \\quad v^2 = u^2 + 2as \\quad s = \\frac{(u+v)t}{2}', notes: 'Valid only for constant acceleration in a straight line.' },
  { topic: 'Theme A: Space, Time & Motion', name: 'Newton\'s Second Law & Momentum', formula: 'F_{net} = ma = \\frac{\\Delta p}{\\Delta t} \\quad p = mv \\quad J = \\Delta p = F\\Delta t', notes: 'Impulse is the area under a Force-Time graph.' },
  { topic: 'Theme A: Space, Time & Motion', name: 'Work, Kinetic Energy & Power', formula: 'W = Fs\\cos\\theta \\quad E_k = \\frac{1}{2}mv^2 = \\frac{p^2}{2m} \\quad P = \\frac{W}{t} = Fv', notes: 'Conservative forces conserve mechanical energy: E_k + E_p = const.' },
  { topic: 'Theme A: Space, Time & Motion', name: 'Circular Motion & Centripetal Force', formula: 'a = \\frac{v^2}{r} = \\omega^2 r \\quad F = \\frac{mv^2}{r} = m\\omega^2 r \\quad v = \\omega r', notes: 'Acceleration always points towards the centre of the circular orbit.' },
  // Thermal
  { topic: 'Theme B: Particulate Nature of Matter', name: 'Specific Heat & Latent Heat', formula: 'Q = mc\\Delta T \\quad Q = mL', notes: 'L is latent heat of fusion or vaporization during phase transitions.' },
  { topic: 'Theme B: Particulate Nature of Matter', name: 'Ideal Gas Law & Kinetic Energy', formula: 'pV = nRT = N k_B T \\quad \\bar{E}_k = \\frac{3}{2}k_B T = \\frac{3}{2}\\frac{R}{N_A}T', notes: 'Temperature T must ALWAYS be in Kelvin.' },
  // Waves
  { topic: 'Theme C: Wave Behaviour', name: 'Wave Speed, Frequency & Period', formula: 'v = f\\lambda \\quad T = \\frac{1}{f} \\quad I \\propto A^2 \\quad I = \\frac{P}{4\\pi r^2}', notes: 'Intensity follows inverse-square law for spherical point sources.' },
  { topic: 'Theme C: Wave Behaviour', name: 'Diffraction & Single Slit Minimum', formula: '\\theta = \\frac{\\lambda}{b} \\quad s = \\frac{\\lambda D}{d} \\quad (\\text{Double Slit})', notes: 'b is slit width, d is slit separation, D is screen distance.' },
  { topic: 'Theme C: Wave Behaviour', name: 'Doppler Effect', formula: 'f\' = f \\left(\\frac{v}{v \\pm u_s}\\right) \\quad f\' = f \\left(\\frac{v \\pm u_o}{v}\\right)', notes: 'Towards: frequency increases (subtract in denominator for moving source).' },
  // Fields & Electricity
  { topic: 'Theme D: Fields', name: 'Coulomb\'s Law & Electric Field', formula: 'F = k\\frac{|q_1 q_2|}{r^2} = \\frac{q_1 q_2}{4\\pi\\varepsilon_0 r^2} \\quad E = \\frac{F}{q} = \\frac{kQ}{r^2}', notes: 'Radial electric field from point charge Q.' },
  { topic: 'Theme D: Fields', name: 'Gravitational Force & Field Strength', formula: 'F_g = G\\frac{M m}{r^2} \\quad g = \\frac{GM}{r^2} \\quad V_g = -\\frac{GM}{r}', notes: 'Gravitational potential is always negative and approaches 0 at infinity.' },
  { topic: 'Theme D: Fields', name: 'Ohm\'s Law & Electrical Power', formula: 'V = IR \\quad P = VI = I^2 R = \\frac{V^2}{R} \\quad R = \\rho\\frac{L}{A}', notes: 'Rho is resistivity in ohm-metres.' },
  { topic: 'Theme D: Fields', name: 'Magnetic Force & Induction', formula: 'F = qvB\\sin\\theta \\quad F = ILB\\sin\\theta \\quad \\Phi = BA\\cos\\theta \\quad \\mathcal{E} = -N\\frac{\\Delta\\Phi}{\\Delta t}', notes: 'Faraday-Lenz Law: negative sign indicates opposition to flux change.' },
  // Nuclear
  { topic: 'Theme E: Nuclear & Quantum', name: 'Photon Energy & De Broglie Wavelength', formula: 'E = hf = \\frac{hc}{\\lambda} \\quad \\lambda = \\frac{h}{p} = \\frac{h}{mv}', notes: 'Wave-particle duality: de Broglie connects momentum to wavelength.' },
  { topic: 'Theme E: Nuclear & Quantum', name: 'Mass-Energy Equivalence & Radioactive Decay', formula: 'E = mc^2 \\quad N = N_0 e^{-\\lambda t} \\quad T_{1/2} = \\frac{\\ln 2}{\\lambda}', notes: 'Half-life relation: lambda is the decay constant in s^-1.' },
];

const CHEMISTRY_DATA: IBFormulaItem[] = [
  { topic: 'Structure 1: Models of the Atom', name: 'Wavelength & Frequency Relation', formula: 'c = \\nu\\lambda \\quad E = h\\nu = \\frac{hc}{\\lambda}', notes: 'Planck relation for electron transitions and emission spectroscopy.' },
  { topic: 'Structure 1: Models of the Atom', name: 'The Mole & Avogadro Constant', formula: 'n = \\frac{m}{M} = \\frac{N}{N_A} = c \\cdot V = \\frac{V}{V_m}', notes: 'V_m = 22.7 dm^3/mol at STP (0°C, 100 kPa).' },
  { topic: 'Structure 2: Chemical Bonding', name: 'Formal Charge Formula', formula: 'FC = V - N - \\frac{B}{2}', notes: 'V = valence electrons, N = non-bonding lone pair electrons, B = shared bonding electrons.' },
  { topic: 'Structure 3: Classification of Matter', name: 'Ideal Gas & Gas Densities', formula: 'pV = nRT \\quad \\rho = \\frac{pM}{RT}', notes: 'R = 8.314 J K^-1 mol^-1. Pressure in Pa, volume in m^3.' },
  { topic: 'Reactivity 1: What drives chemical change?', name: 'Enthalpy Change Equations', formula: 'q = mc\\Delta T \\quad \\Delta H = \\sum \\Delta H_f^\\circ(\\text{products}) - \\sum \\Delta H_f^\\circ(\\text{reactants})', notes: 'Using Bond Enthalpies: Delta H = Sum(Bonds Broken) - Sum(Bonds Formed).' },
  { topic: 'Reactivity 1: What drives chemical change?', name: 'Gibbs Free Energy & Spontaneity', formula: '\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ = -RT\\ln K', notes: 'Spontaneous reaction when Delta G < 0. Equilibrium when Delta G = 0.' },
  { topic: 'Reactivity 2: How much, how fast?', name: 'Rate Law & Arrhenius Equation', formula: '\\text{Rate} = k[A]^m [B]^n \\quad k = A e^{-\\frac{E_a}{RT}} \\quad \\ln k = -\\frac{E_a}{R}\\left(\\frac{1}{T}\\right) + \\ln A', notes: 'Slope of Arrhenius plot (ln k vs 1/T) equals -E_a / R.' },
  { topic: 'Reactivity 3: What are the mechanisms?', name: 'pH, pOH & Acid-Base Dissociation', formula: '\\text{pH} = -\\log[H^+] \\quad K_w = [H^+][OH^-] = 1.0 \\times 10^{-14} \\quad \\text{pH} + \\text{pOH} = 14', notes: 'For weak acids: K_a = [H^+][A^-] / [HA]. Henderson-Hasselbalch: pH = pKa + log([A-]/[HA]).' },
  { topic: 'Spectroscopy Reference', name: 'Infrared (IR) Characteristic Wavenumbers', formula: 'O-H \\text{ (alcohol)}: 3200-3600\\text{ cm}^{-1} \\quad C=O \\text{ (carbonyl)}: 1700-1750\\text{ cm}^{-1} \\quad C-H: 2850-3090\\text{ cm}^{-1}', notes: 'Broad deep peak at 3200-3600 cm^-1 confirms hydroxyl group.' },
];

export default function IBBookletViewerModal({
  isOpen,
  onClose,
  defaultSubject = 'math-aa',
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: BookletSubject;
}) {
  const [subject, setSubject] = useState<BookletSubject>(defaultSubject);
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const currentList = subject === 'physics' ? PHYSICS_FORMULAS : subject === 'chemistry' ? CHEMISTRY_DATA : [];

  const filteredFormulas = currentList.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.topic.toLowerCase().includes(search.toLowerCase()) ||
      item.notes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '0' : '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: isFullscreen ? '0' : '8px',
          width: isFullscreen ? '100vw' : '94vw',
          maxWidth: isFullscreen ? '100vw' : '1100px',
          height: isFullscreen ? '100vh' : '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
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
                background: 'var(--ink)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                Official IB Formula & Data Booklets
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                Authoritative Curriculum References for Examinations
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
              }}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFullscreen ? 'Restore' : 'Expand'}</span>
            </button>

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

        {/* Subject Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            background: '#fafafa',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSubject('math-aa')}
              className={`filter-btn ${subject === 'math-aa' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
            >
              <Calculator size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Math AA Booklet (PDF)
            </button>

            <button
              type="button"
              onClick={() => setSubject('physics')}
              className={`filter-btn ${subject === 'physics' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
            >
              <Atom size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Physics Data Booklet (2025/26)
            </button>

            <button
              type="button"
              onClick={() => setSubject('chemistry')}
              className={`filter-btn ${subject === 'chemistry' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
            >
              <FlaskConical size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Chemistry Data Booklet (2025/26)
            </button>

            <button
              type="button"
              onClick={() => setSubject('math-ai')}
              className={`filter-btn ${subject === 'math-ai' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
            >
              <FileText size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Math Comprehensive Sheet (PDF)
            </button>
          </div>

          {(subject === 'physics' || subject === 'chemistry') && (
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search formula or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem 0.35rem 2rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {subject === 'math-aa' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '0.6rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  Mathematics: Analysis and Approaches Formula Booklet (First Assessment 2021)
                </span>
                <a
                  href="/vault/ib-booklets/Math_AA_Formula_Booklet.pdf"
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <Download size={13} /> Download PDF
                </a>
              </div>
              <iframe
                src="/vault/ib-booklets/Math_AA_Formula_Booklet.pdf#toolbar=1"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Math AA Formula Booklet"
              />
            </div>
          )}

          {subject === 'math-ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '0.6rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  Mathematics AA HL Ultimate Comprehensive Formula Sheet
                </span>
                <a
                  href="/vault/ib-booklets/Math_AA_Comprehensive_Sheet.pdf"
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <Download size={13} /> Download PDF
                </a>
              </div>
              <iframe
                src="/vault/ib-booklets/Math_AA_Comprehensive_Sheet.pdf#toolbar=1"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Math AA Comprehensive Sheet"
              />
            </div>
          )}

          {(subject === 'physics' || subject === 'chemistry') && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredFormulas.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '1.25rem',
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                          color: 'var(--accent)',
                          fontWeight: 600,
                        }}
                      >
                        {item.topic}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        Ref #{idx + 1}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.6rem 0' }}>{item.name}</h3>

                    {/* Formula Render Box */}
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(28,28,30,0.02)',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        marginBottom: '0.5rem',
                        overflowX: 'auto',
                      }}
                    >
                      <MathView content={`$$${item.formula}$$`} />
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: '1.4' }}>
                      <strong>Examiner Note:</strong> {item.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border)',
            background: 'rgba(28,28,30,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--muted)',
          }}
        >
          <span>All booklets match the official International Baccalaureate curriculum guidelines.</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

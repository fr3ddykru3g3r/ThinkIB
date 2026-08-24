'use client';

import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, CheckCircle2, AlertCircle, FileText, ChevronRight, Sparkles } from 'lucide-react';

interface TopicDetail {
  code: string;
  title: string;
  level: 'SL/HL' | 'HL Only' | 'SL Only';
  summary: string;
  keyPoints: string[];
  examTips: string;
  noteLink?: string;
}

interface SyllabusUnit {
  unitTitle: string;
  unitCode: string;
  topics: TopicDetail[];
}

interface SubjectData {
  name: string;
  badge: string;
  description: string;
  units: SyllabusUnit[];
}

const INTHINKING_DATA: Record<string, SubjectData> = {
  chemistry: {
    name: 'Chemistry',
    badge: 'SL/HL · 2025 Syllabus',
    description: 'Structure and Reactivity framework featuring 2025 syllabus roadmaps, mechanism diagrams, and exam criteria.',
    units: [
      {
        unitCode: 'S1',
        unitTitle: 'Structure 1: Models of the Particulate Nature of Matter',
        topics: [
          {
            code: 'S1.1',
            title: 'Introduction to the Particulate Nature of Matter',
            level: 'SL/HL',
            summary: 'Kinetic molecular theory, states of matter, Maxwell-Boltzmann distributions, and phase changes.',
            keyPoints: ['State transitions occur at constant temperature', 'Intermolecular forces vs covalent bonds during phase change', 'Vapor pressure equilibrium'],
            examTips: 'Clearly distinguish between breaking intermolecular forces (during boiling) and breaking intramolecular covalent bonds.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S1.2',
            title: 'The Nuclear Atom & Mass Spectrometry',
            level: 'SL/HL',
            summary: 'Subatomic particles, isotopes, isotopic abundance calculations, and mass spectrometer operation.',
            keyPoints: ['Relative atomic mass (Ar) weighted average equation', 'Isotopic peak heights from mass spectra', 'Nuclear notation (A/Z)'],
            examTips: 'Always quote relative atomic mass to two decimal places in calculation steps.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S1.3',
            title: 'Electronic Configurations & Successive Ionization Energies',
            level: 'SL/HL',
            summary: 'Bohr model, emission spectra, energy levels (s, p, d, f subshells), Hund\'s rule, and Pauli exclusion principle.',
            keyPoints: ['Convergence limit corresponds to ionization energy: E = h·v', 'Large jumps in successive IE identify periodic group', 'Exceptions in Cr [Ar] 4s1 3d5 and Cu [Ar] 4s1 3d10'],
            examTips: 'When asked for ionization equations, ALWAYS include state symbols: X(g) → X+(g) + e-.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S1.4',
            title: 'Counting Particles by Mass — The Mole Concept',
            level: 'SL/HL',
            summary: 'Avogadro constant, molar mass, empirical and molecular formula determination, percentage yield, and atom economy.',
            keyPoints: ['n = m / M', 'Atom economy = (molar mass of desired product / molar mass of all reactants) × 100%', 'Hydrated salt heating calculations'],
            examTips: 'Maintain minimum 3 significant figures throughout multi-step stoichiometry calculations.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S1.5',
            title: 'Ideal Gases & Real Gas Deviations',
            level: 'SL/HL',
            summary: 'Ideal gas equation PV = nRT, molar gas volume, and conditions where real gases deviate from ideality.',
            keyPoints: ['P in Pa, V in m³, T in Kelvin (T_K = T_C + 273.15)', 'Real gases deviate most at HIGH pressure and LOW temperature due to particle volume and IMF attractions'],
            examTips: 'Watch units closely: convert cm³ to m³ by dividing by 1,000,000 (or kPa to Pa by multiplying by 1,000).',
            noteLink: '/savemyexams'
          }
        ]
      },
      {
        unitCode: 'S2',
        unitTitle: 'Structure 2: Models of Bonding & Structure',
        topics: [
          {
            code: 'S2.1',
            title: 'The Ionic Model & Lattice Enthalpy',
            level: 'SL/HL',
            summary: 'Formation of ions, electrostatic attraction in giant ionic lattices, physical properties, and lattice energy trends.',
            keyPoints: ['Lattice enthalpy increases with higher ionic charge and smaller ionic radii', 'Electrical conductivity requires mobile ions (liquid or aqueous state)'],
            examTips: 'Explain melting points using the strength of electrostatic forces between oppositely charged ions.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S2.2',
            title: 'The Covalent Model & VSEPR Molecular Geometry',
            level: 'SL/HL',
            summary: 'Single/double/triple bonds, bond length/strength trends, Lewis structures, resonance, and VSEPR predictions (2 to 6 electron domains).',
            keyPoints: ['Lone pair-lone pair repulsion > lone pair-bond pair > bond pair-bond pair', 'Formal charge = V - N - (B/2)', 'Bond angles: tetrahedral 109.5°, pyramidal 107°, bent 104.5°, octahedral 90°'],
            examTips: 'For formal charge, the most stable structure minimizes formal charges and places negative charges on the most electronegative atoms.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S2.3',
            title: 'Intermolecular Forces & London Dispersion Forces',
            level: 'SL/HL',
            summary: 'London dispersion forces, dipole-dipole attractions, and hydrogen bonding (N, O, F bonded to H).',
            keyPoints: ['LDF strength increases with polarizability (total number of electrons)', 'Hydrogen bonding explains abnormally high boiling points of H2O, HF, NH3'],
            examTips: 'Never refer to covalent bonds breaking when discussing simple molecular melting/boiling points.',
            noteLink: '/savemyexams'
          },
          {
            code: 'S2.4',
            title: 'The Metallic Model & Alloys',
            level: 'SL/HL',
            summary: 'Delocalized electron sea model, metallic bonding strength, electrical/thermal conductivity, and alloy properties.',
            keyPoints: ['Metallic strength increases with smaller ionic radius and more delocalized valence electrons', 'Alloys are harder due to disrupted regular lattice planes hindering sliding'],
            examTips: 'Describe conductivity as movement of delocalized electrons through the giant metallic lattice under potential difference.',
            noteLink: '/savemyexams'
          }
        ]
      },
      {
        unitCode: 'R1',
        unitTitle: 'Reactivity 1: What Drives Chemical Reactions?',
        topics: [
          {
            code: 'R1.1',
            title: 'Measuring Enthalpy Changes & Calorimetry',
            level: 'SL/HL',
            summary: 'Exothermic vs endothermic profiles, q = mcΔT calculations, standard enthalpy definitions, and heat loss corrections.',
            keyPoints: ['ΔH = -q / n_limiting', 'Extrapolation cooling curves compensate for heat loss to surroundings', 'Exothermic: bond making exceeds bond breaking (ΔH < 0)'],
            examTips: 'Remember that when temperature rises, q is positive, making ΔH negative (exothermic).',
            noteLink: '/savemyexams'
          },
          {
            code: 'R1.2',
            title: 'Energy Cycles, Hess\'s Law & Born-Haber Cycles',
            level: 'SL/HL',
            summary: 'Hess\'s Law cycles, enthalpy of formation (ΔHf°), enthalpy of combustion (ΔHc°), and Born-Haber lattice cycles (HL).',
            keyPoints: ['ΔH_rxn = ΣΔHf°(products) - ΣΔHf°(reactants)', 'ΔH_rxn = ΣΔH_bonds(broken) - ΣΔH_bonds(formed)', 'Born-Haber: Atomization + IE + Bond Dissociation + EA + Lattice Enthalpy'],
            examTips: 'Bond enthalpy calculations use gaseous states only; include enthalpy of vaporization if liquids are involved.',
            noteLink: '/savemyexams'
          },
          {
            code: 'R1.3',
            title: 'Entropy & Gibbs Free Energy (HL)',
            level: 'HL Only',
            summary: 'Entropy (S°), spontaneity criterion ΔG° = ΔH° - TΔS°, and equilibrium constant relationship ΔG° = -RT ln K.',
            keyPoints: ['ΔS_system = ΣS°(products) - ΣS°(reactants)', 'Reaction is spontaneous when ΔG° < 0', 'Temperature for spontaneity threshold: T_switch = ΔH° / ΔS°'],
            examTips: 'Ensure units match: ΔH is in kJ·mol⁻¹, whereas ΔS is in J·K⁻¹·mol⁻¹ (must divide ΔS by 1000).',
            noteLink: '/savemyexams'
          }
        ]
      }
    ]
  },
  biology: {
    name: 'Biology',
    badge: 'SL/HL · 2025 Syllabus',
    description: 'Comprehensive 4-theme framework: Unity & Diversity, Form & Function, Interaction & Interdependence, and Continuity & Change.',
    units: [
      {
        unitCode: 'Theme A',
        unitTitle: 'Unity & Diversity',
        topics: [
          {
            code: 'A1.1',
            title: 'Water & the Chemistry of Life',
            level: 'SL/HL',
            summary: 'Polarity, hydrogen bonding, thermal properties, cohesive/adhesive forces, and water as universal biological solvent.',
            keyPoints: ['High specific heat capacity buffers cellular environments', 'Latent heat of vaporization powers sweat cooling', 'Xylem transpiration stream driven by cohesion & adhesion'],
            examTips: 'Link water polarity directly to its solvent action with hydrophilic vs hydrophobic substances.',
            noteLink: '/savemyexams'
          },
          {
            code: 'A1.2',
            title: 'Nucleic Acids (DNA, RNA & ATP)',
            level: 'SL/HL',
            summary: 'Nucleotide structure, phosphodiester bonds, antiparallel double helix, base pairing rules, and Hershey-Chase experiments.',
            keyPoints: ['Purines (A, G - double ring) pair with Pyrimidines (T, C, U - single ring)', '5\' to 3\' directionality driven by 5\' phosphate and 3\' -OH group'],
            examTips: 'Be prepared to draw a simple 4-nucleotide diagram showing alternating sugars and phosphates with hydrogen bonds between bases.',
            noteLink: '/savemyexams'
          },
          {
            code: 'A2.1',
            title: 'Cell Structure & Origin of Eukaryotes',
            level: 'SL/HL',
            summary: 'Prokaryote vs eukaryote ultrastructure, surface area to volume ratio, endosymbiotic theory for mitochondria and chloroplasts.',
            keyPoints: ['Endosymbiosis evidence: 70S ribosomes, circular naked DNA, double membranes, binary fission replication', 'SA:V ratio limits maximum cell size due to diffusion rates'],
            examTips: 'Distinguish between resolution and magnification when interpreting electron micrographs.',
            noteLink: '/savemyexams'
          }
        ]
      },
      {
        unitCode: 'Theme B',
        unitTitle: 'Form & Function',
        topics: [
          {
            code: 'B1.1',
            title: 'Carbohydrates & Lipids',
            level: 'SL/HL',
            summary: 'Monosaccharides, glycosidic bonds, cellulose/starch/glycogen structures, triglycerides, and fatty acid saturation.',
            keyPoints: ['Cellulose: unbranched β-1,4-glucose chains forming microfibrils for plant wall tensile strength', 'Triglycerides store 2x energy per gram compared to carbohydrates'],
            examTips: 'Contrast glycogen (rapid mobilization, branched) with lipid energy storage (long-term, insoluble, high energy density).',
            noteLink: '/savemyexams'
          },
          {
            code: 'B1.2',
            title: 'Proteins & Enzyme Kinetics',
            level: 'SL/HL',
            summary: 'Primary to quaternary structure, denaturation, active site substrate binding, competitive vs non-competitive inhibition.',
            keyPoints: ['Competitive inhibitors increase Km without changing Vmax', 'Non-competitive inhibitors reduce Vmax without altering Km', 'Denaturation disrupts secondary/tertiary hydrogen & ionic bonds'],
            examTips: 'Sketch and label enzyme rate graphs showing substrate concentration with and without inhibitors.',
            noteLink: '/savemyexams'
          }
        ]
      }
    ]
  },
  mathanalysis: {
    name: 'Mathematics Analysis & Approaches',
    badge: 'AA SL / HL',
    description: 'Rigorous mathematical proof, calculus foundations, vector spaces, and probability modeling with worked exam keys.',
    units: [
      {
        unitCode: 'Topic 1',
        unitTitle: 'Number & Algebra',
        topics: [
          {
            code: '1.1',
            title: 'Sequences, Series & Binomial Expansion',
            level: 'SL/HL',
            summary: 'Arithmetic and geometric progressions, infinite geometric sums (|r| < 1), and general binomial theorem (n choose r).',
            keyPoints: ['Sum to infinity: S_inf = u1 / (1 - r)', 'General term: T_(r+1) = (n C r) · a^(n-r) · b^r', 'Fractional and negative binomial expansions (HL)'],
            examTips: 'Always check if |r| < 1 before calculating sum to infinity of a geometric series.',
            noteLink: '/math-mocks'
          },
          {
            code: '1.2',
            title: 'Complex Numbers & De Moivre\'s Theorem (HL)',
            level: 'HL Only',
            summary: 'Cartesian, polar, and Euler forms (z = r·e^(iθ)), roots of unity, and trigonometric identity proofs.',
            keyPoints: ['De Moivre: (r·cis θ)^n = r^n · cis(nθ)', 'n-th roots of a complex number are evenly spaced on a circle of radius r^(1/n) in the Argand plane'],
            examTips: 'Use symmetry when finding the sum of n-th roots of unity (sum is always 0).',
            noteLink: '/math-mocks'
          }
        ]
      },
      {
        unitCode: 'Topic 5',
        unitTitle: 'Calculus',
        topics: [
          {
            code: '5.1',
            title: 'Differentiation & Curve Sketching',
            level: 'SL/HL',
            summary: 'Chain, product, and quotient rules, tangents/normals, stationary points, points of inflection (f\'\'(x) = 0 with concavity change).',
            keyPoints: ['First derivative test for local extrema', 'Second derivative test: f\'\'(x) > 0 implies local minimum', 'L\'Hôpital\'s rule for 0/0 indeterminate forms (HL)'],
            examTips: 'A point where f\'\'(x) = 0 is ONLY an inflection point if the second derivative changes sign across that point.',
            noteLink: '/math-mocks'
          },
          {
            code: '5.2',
            title: 'Integration, Differential Equations & Volumes of Revolution',
            level: 'SL/HL',
            summary: 'Substitution, integration by parts, partial fractions, separable differential equations, and volumes revolved around x/y axes.',
            keyPoints: ['Integration by parts: ∫ u v\' dx = uv - ∫ u\' v dx', 'Volume of revolution: V = π ∫ y² dx', 'Integrating factor method for dy/dx + P(x)y = Q(x) (HL)'],
            examTips: 'Never forget the constant of integration (+ C) on indefinite integrals — marks are strictly penalized.',
            noteLink: '/math-mocks'
          }
        ]
      }
    ]
  },
  economics: {
    name: 'Economics',
    badge: 'SL/HL',
    description: 'Microeconomics, Macroeconomics, and Global Trade frameworks with real-world evaluation templates.',
    units: [
      {
        unitCode: 'Unit 2',
        unitTitle: 'Microeconomics & Market Failure',
        topics: [
          {
            code: '2.1',
            title: 'Demand, Supply & Price Elasticity (PED, YED, PES)',
            level: 'SL/HL',
            summary: 'Law of demand/supply, non-price determinants, consumer/producer surplus, and price elasticity formulas.',
            keyPoints: ['PED = %ΔQd / %ΔP', 'PED > 1 (elastic): lowering price increases total revenue', 'YED > 0 (normal good), YED < 0 (inferior good)'],
            examTips: 'Always define elasticity terms precisely and state the units when explaining real-world pricing decisions.',
            noteLink: '/savemyexams'
          },
          {
            code: '2.2',
            title: 'Market Failure & Environmental Externalities',
            level: 'SL/HL',
            summary: 'Negative externalities of production/consumption, common pool resources, Pigouvian carbon taxes, and cap-and-trade systems.',
            keyPoints: ['Negative production externality: MSC > MPC (overproduction at market equilibrium Qm vs socially optimal Qopt)', 'Deadweight welfare loss triangle points toward social optimum'],
            examTips: 'Clearly shade the deadweight welfare loss area between MSC and MSB curves on diagrams.',
            noteLink: '/savemyexams'
          }
        ]
      }
    ]
  },
  psychology: {
    name: 'Psychology',
    badge: 'SL/HL',
    description: 'Biological, Cognitive, and Sociocultural approaches to understanding human behavior with core empirical study evaluations.',
    units: [
      {
        unitCode: 'Bio',
        unitTitle: 'Biological Approach to Behavior',
        topics: [
          {
            code: 'Bio.1',
            title: 'Localization of Function & Neuroplasticity',
            level: 'SL/HL',
            summary: 'Brain regions (hippocampus, amygdala, prefrontal cortex), neuroplasticity, and synaptic pruning.',
            keyPoints: ['Maguire et al. (2000): London taxi drivers show increased posterior hippocampal volume correlation with navigation experience', 'HM (Scoville & Milner, 1957): Bilateral medial temporal lobe resection caused anterograde amnesia while sparing procedural memory'],
            examTips: 'In ERQs (22-markers), evaluate research methodologies: sampling bias, MRI spatial resolution, and bidirectional ambiguity.',
            noteLink: '/savemyexams'
          }
        ]
      }
    ]
  },
  bm_econ: {
    name: 'Business Management',
    badge: 'SL/HL',
    description: 'Strategic analysis, financial accounting, marketing strategies, and operations management modules.',
    units: [
      {
        unitCode: 'Unit 3',
        unitTitle: 'Finance & Accounts',
        topics: [
          {
            code: '3.1',
            title: 'Break-Even Analysis & Final Accounts',
            level: 'SL/HL',
            summary: 'Break-even quantity = Fixed Costs / (Price - Variable Cost per unit), margin of safety, and balance sheets.',
            keyPoints: ['Contribution per unit = Selling Price - Variable Cost', 'Margin of safety = Current Output - Break-even Output'],
            examTips: 'Label the break-even chart completely: Total Revenue, Total Cost, Fixed Cost lines, break-even point, and margin of safety.',
            noteLink: '/savemyexams'
          }
        ]
      }
    ]
  },
  history: {
    name: 'History',
    badge: 'HL',
    description: '20th Century Authoritarian States, Cold War Superpower Tensions, and historiographical analysis guides.',
    units: [
      {
        unitCode: 'Topic 10',
        unitTitle: 'Authoritarian States (20th Century)',
        topics: [
          {
            code: '10.1',
            title: 'Emergence, Consolidation & Maintenance of Power',
            level: 'HL Only',
            summary: 'Conditions producing authoritarian regimes, use of force, propaganda, charismatic leadership, and treatment of opposition.',
            keyPoints: ['Compare conditions (economic instability vs political polarization) in emergence', 'Contrast structuralist vs intentionalist historiographical perspectives'],
            examTips: 'Structure Paper 2 essays thematically rather than narratively, comparing two leaders from different regions across identical criteria.',
            noteLink: '/savemyexams'
          }
        ]
      }
    ]
  },
  englisha: {
    name: 'English A Language & Literature',
    badge: 'Lang/Lit',
    description: 'Paper 1 Guided Textual Analysis strategies, stylistic device taxonomies, and Paper 2 comparative essay frameworks.',
    units: [
      {
        unitCode: 'Paper 1',
        unitTitle: 'Guided Textual Analysis Mastery',
        topics: [
          {
            code: 'P1.1',
            title: 'Non-Literary Form & Stylistic Device Analysis',
            level: 'SL/HL',
            summary: 'Modal verbs, visual rhetoric, typography, register, framing, and audience positioning in unseen non-literary texts.',
            keyPoints: ['Analyze how stylistic choices create specific meaning rather than simply listing devices (technique spotting)', 'Integrate the guiding question directly into each paragraph\'s topic sentence'],
            examTips: 'Follow the PEEL / PEAL analytical structure: Point, Evidence, Analysis (effect on target reader), Link to authorial purpose.',
            noteLink: '/past-papers'
          }
        ]
      }
    ]
  }
};

export default function ThinkIBPage() {
  const [selectedKey, setSelectedKey] = useState<string>('chemistry');
  const [activeTopic, setActiveTopic] = useState<TopicDetail | null>(
    INTHINKING_DATA['chemistry'].units[0].topics[0]
  );

  const currentSubject = INTHINKING_DATA[selectedKey] || INTHINKING_DATA['chemistry'];

  const handleSelectSubject = (key: string) => {
    setSelectedKey(key);
    const sub = INTHINKING_DATA[key];
    if (sub && sub.units.length > 0 && sub.units[0].topics.length > 0) {
      setActiveTopic(sub.units[0].topics[0]);
    } else {
      setActiveTopic(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[VAULT_MOUNT: INTHINKING_SYLLABUS_DATABASE]</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>InThinking Syllabus & Study Database</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            Structured syllabus units, essential understandings, worked exam advice, and revision notes across all 8 major IBDP subjects.
          </p>
        </div>
        <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>

      {/* Subject Filter Bar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Select Subject Vault</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.keys(INTHINKING_DATA).map((key) => {
            const sub = INTHINKING_DATA[key];
            const isActive = selectedKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectSubject(key)}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              >
                {sub.name} <span style={{ opacity: 0.7, fontSize: '0.7rem', marginLeft: '4px' }}>[{sub.badge}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Syllabus Explorer & Reader */}
      <div className="split-screen" style={{ height: 'calc(100vh - 270px)', minHeight: '620px' }}>
        {/* Left Column: Syllabus Units & Topics Navigation */}
        <div className="panel browser-panel" style={{ overflowY: 'auto', paddingRight: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span className="tech-label" style={{ color: 'var(--rust)', display: 'block', marginBottom: '0.3rem' }}>
              {currentSubject.name.toUpperCase()} · SYLLABUS ROADMAP
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
              {currentSubject.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            {currentSubject.units.map((unit, uIdx) => (
              <div key={uIdx}>
                <div style={{ padding: '0.4rem 0.6rem', background: 'rgba(28, 28, 30, 0.04)', borderRadius: '4px', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                    {unit.unitCode}: {unit.unitTitle}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {unit.topics.map((t, tIdx) => {
                    const isSelected = activeTopic?.code === t.code;
                    return (
                      <div
                        key={tIdx}
                        onClick={() => setActiveTopic(t)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem 0.75rem',
                          background: isSelected ? 'rgba(184, 74, 57, 0.08)' : 'var(--panel-light)',
                          border: isSelected ? '1.5px solid var(--rust)' : '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ overflow: 'hidden', paddingRight: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--rust)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              {t.code}
                            </span>
                            <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px', background: isSelected ? 'var(--rust)' : 'rgba(28,28,30,0.06)', color: isSelected ? '#fff' : 'var(--muted)', fontWeight: 600 }}>
                              {t.level}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 500, color: 'var(--ink)', display: 'block', lineHeight: '1.25' }}>
                            {t.title}
                          </span>
                        </div>
                        <ChevronRight size={14} style={{ color: isSelected ? 'var(--rust)' : 'var(--muted)', flexShrink: 0 }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deep Topic Study & Examination Reader */}
        <div className="viewer-panel" style={{ overflowY: 'auto', padding: '1.5rem' }}>
          {activeTopic ? (
            <div>
              {/* Header */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '3px', background: 'var(--rust)', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {activeTopic.code}
                    </span>
                    <span className="tech-label">{activeTopic.level}</span>
                  </div>
                  {activeTopic.noteLink && (
                    <a
                      href={activeTopic.noteLink}
                      className="filter-btn active"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.3rem 0.75rem', background: 'var(--panel-light)', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <FileText size={13} /> Open SaveMyExams Notes
                    </a>
                  )}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', margin: 0, color: 'var(--ink)' }}>
                  {activeTopic.title}
                </h2>
              </div>

              {/* Topic Overview */}
              <div style={{ marginBottom: '1.75rem' }}>
                <span className="tech-label" style={{ display: 'block', marginBottom: '0.5rem' }}>SYLLABUS UNDERSTANDING</span>
                <p style={{ fontSize: '1.02rem', lineHeight: '1.6', color: 'var(--ink)', background: 'rgba(28,28,30,0.02)', padding: '1rem', borderLeft: '3px solid var(--rust)', borderRadius: '0 4px 4px 0' }}>
                  {activeTopic.summary}
                </p>
              </div>

              {/* Key Concept Points */}
              <div style={{ marginBottom: '1.75rem' }}>
                <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>CORE EXAM TAKEAWAYS & FORMULAS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {activeTopic.keyPoints.map((kp, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', background: 'var(--panel-light)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.92rem', color: 'var(--ink)', lineHeight: '1.45' }}>{kp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examiner Pitfalls & Tips */}
              <div style={{ padding: '1.2rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <AlertCircle size={16} style={{ color: '#d97706' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    InThinking Examiner Pitfall & Markscheme Advice
                  </span>
                </div>
                <p style={{ fontSize: '0.92rem', color: '#78350f', margin: 0, lineHeight: '1.5' }}>
                  {activeTopic.examTips}
                </p>
              </div>

              {/* Quick Actions Footer */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <a href="/savemyexams" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '4px', background: 'var(--rust)', color: '#fff' }}>
                  <BookOpen size={14} /> Full SaveMyExams Notes Vault
                </a>
                <a href="/past-papers" className="filter-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '4px', background: 'var(--panel-light)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                  <FileText size={14} /> Search Related Past Papers
                </a>
              </div>
            </div>
          ) : (
            <div className="viewer-placeholder">
              <BookOpen size={48} style={{ color: 'var(--rust)', marginBottom: '1rem', opacity: 0.4 }} />
              <h3>Select a Syllabus Topic</h3>
              <p style={{ maxWidth: '320px', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Choose any syllabus chapter or unit from the left navigation tree to inspect essential understandings and exam criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

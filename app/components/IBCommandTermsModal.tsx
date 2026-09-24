'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, AlertTriangle, CheckCircle2, HelpCircle, Layers, Lightbulb } from 'lucide-react';

interface CommandTerm {
  term: string;
  ao: 'AO1' | 'AO2' | 'AO3';
  aoLabel: string;
  subjects: ('Sciences' | 'Individuals & Societies' | 'Mathematics')[];
  definition: string;
  markschemeRule: string;
  pitfall: string;
  example: {
    subject: string;
    question: string;
    goodResponse: string;
    badResponse: string;
  };
}

const COMMAND_TERMS: CommandTerm[] = [
  // AO1: Knowledge and Understanding
  {
    term: 'Define',
    ao: 'AO1',
    aoLabel: 'AO1: Knowledge & Understanding',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Give the precise meaning of a word, phrase, concept or physical quantity.',
    markschemeRule: 'Requires textbook verbatim or mathematically precise definitions. No credit given for just providing examples without the core concept.',
    pitfall: 'Providing an example instead of the definition (e.g., stating "an enzyme is like lactase" instead of "a biological catalyst that lowers activation energy").',
    example: {
      subject: 'Economics / Chemistry',
      question: 'Define opportunity cost.',
      goodResponse: 'The next best alternative foregone when an economic decision is made.',
      badResponse: 'When you choose one thing and miss out on buying something else like shoes.'
    }
  },
  {
    term: 'Draw',
    ao: 'AO1',
    aoLabel: 'AO1: Knowledge & Understanding',
    subjects: ['Sciences', 'Mathematics'],
    definition: 'Represent by means of a labelled, accurate diagram or graph, using a pencil. Straight lines must be ruled. Diagrams must be to scale where applicable.',
    markschemeRule: 'Pencil only. Use a ruler for axes and straight lines. Points must be plotted accurately with small crosses or dots with circles. Curves must be smooth with no kinks or multiple lines.',
    pitfall: 'Freehand sketching without a ruler, using ink, or drawing sketchy/feathered lines instead of a single continuous stroke.',
    example: {
      subject: 'Biology / Physics',
      question: 'Draw a labelled diagram of the fluid mosaic model of the plasma membrane.',
      goodResponse: 'Phospholipid bilayer drawn with round heads and wavy tails, integral protein spanning the membrane, peripheral protein on surface, cholesterol inserted, correctly labelled with ruled lines.',
      badResponse: 'Messy freehand circles without distinguishing hydrophilic heads from hydrophobic tails, missing labels.'
    }
  },
  {
    term: 'Label',
    ao: 'AO1',
    aoLabel: 'AO1: Knowledge & Understanding',
    subjects: ['Sciences'],
    definition: 'Add title, labels or brief explanation(s) to a diagram or graph.',
    markschemeRule: 'Guide lines should be straight and point directly to the designated feature without arrowheads overlapping the structure.',
    pitfall: 'Arrowheads placed ambiguously between two adjacent cell organelles or structures.',
    example: {
      subject: 'Biology',
      question: 'Label the mitochondria and chloroplast on the plant cell micrograph.',
      goodResponse: 'Ruled leader lines pointing exactly to the cristae/inner membrane of the mitochondrion and thylakoid stacks of the chloroplast.',
      badResponse: 'Writing the words inside the cell cytoplasm with vague floating arrows.'
    }
  },
  {
    term: 'List',
    ao: 'AO1',
    aoLabel: 'AO1: Knowledge & Understanding',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Give a sequence of brief answers with no explanation.',
    markschemeRule: 'If the question specifies "List three factors...", examiners will strictly only mark the first THREE points written. Any extra points are ignored.',
    pitfall: 'Writing five points hoping the examiner picks the right ones—examiners will ignore numbers 4 and 5!',
    example: {
      subject: 'Environmental Systems / Econ',
      question: 'List three greenhouse gases.',
      goodResponse: '1. Carbon dioxide\n2. Methane\n3. Nitrous oxide',
      badResponse: 'Writing long paragraphs explaining how carbon dioxide traps thermal radiation from burning fossil fuels.'
    }
  },
  {
    term: 'State',
    ao: 'AO1',
    aoLabel: 'AO1: Knowledge & Understanding',
    subjects: ['Sciences', 'Individuals & Societies', 'Mathematics'],
    definition: 'Give a specific name, value or other brief answer without explanation or calculation.',
    markschemeRule: 'A 1-mark question. Examiners want a single keyword, number, or law. Avoid long explanations that could contradict your correct point.',
    pitfall: 'Writing elaborate explanations that trigger the "Contradiction Rule" (if a student writes one correct fact and one incorrect fact in a State question, 0 marks are awarded).',
    example: {
      subject: 'Physics',
      question: 'State Newton’s first law of motion.',
      goodResponse: 'An object remains at rest or continues at constant velocity unless acted upon by a resultant net external force.',
      badResponse: 'Objects keep moving because momentum stays forever unless gravity and friction push it down to the ground.'
    }
  },

  // AO2: Application and Analysis
  {
    term: 'Annotate',
    ao: 'AO2',
    aoLabel: 'AO2: Application & Analysis',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Add brief notes to a diagram or graph.',
    markschemeRule: 'Annotations must explain function, significance, or values—not just identify names (naming is only "Label").',
    pitfall: 'Writing single-word names instead of short explanatory notes describing purpose or condition.',
    example: {
      subject: 'Physics / Economics',
      question: 'Annotate the Keynesian AD/AS diagram to show inflationary pressure.',
      goodResponse: 'Adding notes pointing to the vertical section of the AS curve: "Full employment capacity reached; further AD shift to AD2 increases price level from P1 to P2 without increasing real GDP Yfe."',
      badResponse: 'Only writing "AD" and "AS" on the curves.'
    }
  },
  {
    term: 'Calculate',
    ao: 'AO2',
    aoLabel: 'AO2: Application & Analysis',
    subjects: ['Sciences', 'Mathematics', 'Individuals & Societies'],
    definition: 'Obtain a numerical answer showing the relevant stages in the working.',
    markschemeRule: 'Method marks (M) are awarded for writing the standard formula and substitution, even if calculation produces an arithmetic error. Always round to 3 significant figures unless exact.',
    pitfall: 'Writing only the final numerical answer without intermediate substitution. If the number is incorrect, zero marks are awarded.',
    example: {
      subject: 'Physics / Chemistry',
      question: 'Calculate the acceleration of the 4.0 kg cart under a 12.0 N net force.',
      goodResponse: 'a = F / m\na = 12.0 / 4.0\na = 3.0 m s^-2',
      badResponse: '3 (no units, no working, no formula).'
    }
  },
  {
    term: 'Describe',
    ao: 'AO2',
    aoLabel: 'AO2: Application & Analysis',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Give a detailed account.',
    markschemeRule: 'Requires "what happened" or "what trend is observed", NOT "why it happened" (which is Explain). Quote data points with units from given graphs.',
    pitfall: 'Explaining mechanisms when the question only asks to describe. You waste 5 minutes explaining reasons for which 0 marks exist on the markscheme.',
    example: {
      subject: 'Biology / Economics',
      question: 'Describe the trend in enzyme activity between 20°C and 40°C shown in Figure 1.',
      goodResponse: 'Reaction rate increases steadily from 12 arbitrary units at 20°C to an optimum peak of 48 units at 40°C.',
      badResponse: 'Substrates gain kinetic energy causing more successful collisions per second with the active site (this is an explanation, not a description!).'
    }
  },
  {
    term: 'Distinguish',
    ao: 'AO2',
    aoLabel: 'AO2: Application & Analysis',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Make clear the differences between two or more concepts or items.',
    markschemeRule: 'Marks are only awarded for direct comparative pairs. Points must contrast the exact same attribute across both items.',
    pitfall: 'Writing separate paragraphs about item A and item B that don’t contrast the same characteristic.',
    example: {
      subject: 'Economics / Biology',
      question: 'Distinguish between fiscal policy and monetary policy.',
      goodResponse: 'Fiscal policy manipulates government expenditure and taxation by the government, whereas monetary policy manipulates interest rates and the money supply by the central bank.',
      badResponse: 'Fiscal policy has to do with taxes. Monetary policy is used to fight inflation.'
    }
  },
  {
    term: 'Outline',
    ao: 'AO2',
    aoLabel: 'AO2: Application & Analysis',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Give a brief account or summary.',
    markschemeRule: 'A concise overview highlighting the core steps or factors. No need for exhaustive proof or granular breakdown.',
    pitfall: 'Writing 2 pages for a 2-mark or 3-mark outline question.',
    example: {
      subject: 'Psychology / Biology',
      question: 'Outline the role of ribosomes in translation.',
      goodResponse: 'Ribosomes bind to mRNA, read codons sequentially, and catalyze peptide bond formation between incoming tRNA amino acids.',
      badResponse: 'Writing every subunit coefficient, detailed ribosomal RNA folding and release factor mechanics.'
    }
  },

  // AO3: Synthesis, Evaluation & Formulation
  {
    term: 'Explain',
    ao: 'AO3',
    aoLabel: 'AO3: Synthesis & Evaluation',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Give a detailed account including reasons or causes.',
    markschemeRule: 'Strictly marked on Cause-and-Effect logic chains. Every mark point requires [Claim/Mechanism] linked via [Consequence] (using "therefore", "because", "resulting in").',
    pitfall: 'Describing what happens without explaining the underlying scientific or economic mechanism.',
    example: {
      subject: 'Chemistry',
      question: 'Explain why boiling points increase down the halogen group (Group 17).',
      goodResponse: 'Molecular size and total number of electrons increase from F2 to I2 [1 mark], increasing polarizability and London dispersion force strength [1 mark]; therefore more thermal energy is required to overcome intermolecular forces [1 mark].',
      badResponse: 'Because iodine is heavier than chlorine and fluorine so it boils at a higher temperature.'
    }
  },
  {
    term: 'Discuss',
    ao: 'AO3',
    aoLabel: 'AO3: Synthesis & Evaluation',
    subjects: ['Individuals & Societies', 'Sciences'],
    definition: 'Offer a considered and balanced review that includes a range of arguments, factors or hypotheses. Opinions or conclusions should be presented clearly and supported by appropriate evidence.',
    markschemeRule: 'Unbalanced answers (only giving arguments for or only against) are capped at 50% of the total marks. A synthesis/conclusion is required for top band.',
    pitfall: 'One-sided essays with no counter-arguments, stakeholder perspectives, or limitations.',
    example: {
      subject: 'Economics / Business',
      question: 'Discuss the view that market-based supply-side policies are superior to interventionist policies.',
      goodResponse: 'Analyzes benefits of deregulation/tax cuts (efficiency, incentivizes investment) balanced against drawbacks (income inequality, loss of worker rights, environmental neglect), contrasting with interventionist strengths (human capital, infrastructure), culminating in a synthesized conditional judgment.',
      badResponse: 'Listing only benefits of tax cuts and stating they solve all economic problems.'
    }
  },
  {
    term: 'Evaluate',
    ao: 'AO3',
    aoLabel: 'AO3: Synthesis & Evaluation',
    subjects: ['Individuals & Societies', 'Sciences'],
    definition: 'Make an appraisal by weighing up the strengths and limitations.',
    markschemeRule: 'Requires structured appraisal: Strengths/Benefits + Weaknesses/Limitations + Explicit evaluative judgment or recommendation substantiated by criteria.',
    pitfall: 'Listing pros and cons without providing a final reasoned verdict or recommendation.',
    example: {
      subject: 'Psychology / Biology',
      question: 'Evaluate the use of correlational research in studying human behavior.',
      goodResponse: 'Details strengths (identifies relationships between variables, useful when experimental manipulation is unethical) vs limitations (cannot establish bidirectional causation, prone to third-variable confounding), with an overall appraisal on ecological validity.',
      badResponse: 'Saying correlation is good because it gives a number r between -1 and 1.'
    }
  },
  {
    term: 'Compare and Contrast',
    ao: 'AO3',
    aoLabel: 'AO3: Synthesis & Evaluation',
    subjects: ['Sciences', 'Individuals & Societies'],
    definition: 'Give an account of similarities and differences between two (or more) items or situations, referring to both (all) of them throughout.',
    markschemeRule: 'Marks are strictly split: you MUST provide at least one similarity AND at least one difference. Providing only similarities or only differences forfeits 50% of the marks.',
    pitfall: 'Only providing similarities and forgetting to state differences, or vice versa.',
    example: {
      subject: 'Biology / History',
      question: 'Compare and contrast DNA replication and transcription.',
      goodResponse: 'Both use DNA as a template and synthesize in the 5\' to 3\' direction using complimentary base pairing (similarity). In contrast, replication utilizes DNA polymerase and produces double-stranded DNA, whereas transcription uses RNA polymerase and produces single-stranded RNA (differences).',
      badResponse: 'Talking only about DNA replication in paragraph 1, then only about transcription in paragraph 2 with no connecting words.'
    }
  },
  {
    term: 'To what extent',
    ao: 'AO3',
    aoLabel: 'AO3: Synthesis & Evaluation',
    subjects: ['Individuals & Societies'],
    definition: 'Consider the merits or otherwise of an argument or concept. Opinions and conclusions should be presented clearly and supported with appropriate evidence and sound argument.',
    markschemeRule: 'The classic 15-mark IB essay command. Demands nuanced perspective: "To a great extent in short run, but limited in long run because...", examining multiple stakeholder perspectives (consumers, producers, government).',
    pitfall: 'Answering with a binary "yes" or "no" instead of assessing magnitude, limitations, and time horizons.',
    example: {
      subject: 'History / Economics',
      question: 'To what extent was the New Deal effective in resolving the Great Depression?',
      goodResponse: 'Assesses relief and financial stabilization (FDIC, CCC) to a significant extent, balanced against failure to achieve full employment until wartime production (WWII), concluding with a calibrated judgment.',
      badResponse: 'It worked completely because Roosevelt was a great president and passed laws.'
    }
  },
  {
    term: 'Suggest',
    ao: 'AO3',
    aoLabel: 'AO3: Synthesis & Evaluation',
    subjects: ['Sciences', 'Mathematics', 'Individuals & Societies'],
    definition: 'Propose a solution, hypothesis or other possible answer.',
    markschemeRule: 'Used when there is no single textbook answer or when applying knowledge to an unfamiliar context. Any scientifically or logically valid response receives full marks.',
    pitfall: 'Panicking because you haven’t memorized this specific case study. Examiners are testing your ability to extrapolate principles to new scenarios.',
    example: {
      subject: 'Biology / Physics',
      question: 'Suggest an explanation for why Arctic foxes possess shorter ears than desert foxes.',
      goodResponse: 'Shorter ears reduce surface-area-to-volume ratio, thereby minimizing thermal radiation heat loss in sub-zero environments.',
      badResponse: 'They are born like that because of snow.'
    }
  }
];

export default function IBCommandTermsModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [aoFilter, setAoFilter] = useState<'ALL' | 'AO1' | 'AO2' | 'AO3'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | 'Sciences' | 'Individuals & Societies' | 'Mathematics'>('ALL');
  const [activeTab, setActiveTab] = useState<'matrix' | 'rules'>('matrix');

  const filteredTerms = useMemo(() => {
    return COMMAND_TERMS.filter(item => {
      if (aoFilter !== 'ALL' && item.ao !== aoFilter) return false;
      if (subjectFilter !== 'ALL' && !item.subjects.includes(subjectFilter)) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.markschemeRule.toLowerCase().includes(q) ||
        item.pitfall.toLowerCase().includes(q)
      );
    });
  }, [search, aoFilter, subjectFilter]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--panel)',
          color: 'var(--ink)',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--panel-light)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="tech-label" style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}>
                [IBDP_ASSESSMENT_FRAMEWORK]
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                AO1 / AO2 / AO3 COMMAND MATRIX
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', margin: '0.2rem 0 0', letterSpacing: '-0.02em' }}>
              IB Command Terms & Markscheme Decoders
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => setActiveTab('matrix')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'matrix' ? 'var(--rust)' : 'var(--panel-light)',
                  color: activeTab === 'matrix' ? '#fff' : 'var(--ink)'
                }}
              >
                Command Terms
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'rules' ? 'var(--rust)' : 'var(--panel-light)',
                  color: activeTab === 'rules' ? '#fff' : 'var(--ink)'
                }}
              >
                Examiner Rules
              </button>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'matrix' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(92vh - 85px)', overflow: 'hidden' }}>
            {/* Filter toolbar */}
            <div
              style={{
                padding: '0.9rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--panel)',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              <div className="search-wrapper" style={{ flex: 1, minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Search term (e.g., Explain, Define, Evaluate)..."
                  className="search-input"
                  style={{ padding: '0.45rem 1rem 0.45rem 2.4rem', fontSize: '0.85rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* AO Level selector */}
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Objective:</span>
                {(['ALL', 'AO1', 'AO2', 'AO3'] as const).map(ao => (
                  <button
                    key={ao}
                    className={`filter-btn ${aoFilter === ao ? 'active' : ''}`}
                    onClick={() => setAoFilter(ao)}
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    {ao === 'ALL' ? 'All Objectives' : ao}
                  </button>
                ))}
              </div>

              {/* Subject Group selector */}
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Group:</span>
                {(['ALL', 'Sciences', 'Individuals & Societies', 'Mathematics'] as const).map(grp => (
                  <button
                    key={grp}
                    className={`filter-btn ${subjectFilter === grp ? 'active' : ''}`}
                    onClick={() => setSubjectFilter(grp)}
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    {grp === 'ALL' ? 'All Subjects' : grp === 'Individuals & Societies' ? 'Grp 3 (Econ/Hist)' : grp === 'Sciences' ? 'Grp 4 (Sci)' : 'Grp 5 (Math)'}
                  </button>
                ))}
              </div>
            </div>

            {/* List of command terms */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTerms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
                  <HelpCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p>No command terms found matching "{search}".</p>
                </div>
              ) : (
                filteredTerms.map((ct) => {
                  const aoColor = ct.ao === 'AO1' ? '#2563eb' : ct.ao === 'AO2' ? '#059669' : 'var(--rust)';
                  return (
                    <div
                      key={ct.term}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        background: 'var(--panel-light)',
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                            {ct.term}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '3px',
                              background: 'rgba(0,0,0,0.06)',
                              color: aoColor,
                              border: `1px solid ${aoColor}40`
                            }}
                          >
                            {ct.aoLabel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {ct.subjects.map(s => (
                            <span key={s} style={{ fontSize: '0.68rem', color: 'var(--muted)', background: 'var(--panel)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border)' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Official Definition */}
                      <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink)', lineHeight: '1.5' }}>
                        <strong style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                          IB Official Definition:
                        </strong>
                        {ct.definition}
                      </p>

                      {/* Markscheme Rule & Trap Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem' }}>
                        <div style={{ background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.2)', padding: '0.85rem', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                            <CheckCircle2 size={14} /> EXAMINER MARKSCHEME RULE
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink)', lineHeight: '1.45' }}>
                            {ct.markschemeRule}
                          </p>
                        </div>

                        <div style={{ background: 'rgba(184, 74, 57, 0.05)', border: '1px solid rgba(184, 74, 57, 0.2)', padding: '0.85rem', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--rust)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                            <AlertTriangle size={14} /> COMMON STUDENT PITFALL
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink)', lineHeight: '1.45' }}>
                            {ct.pitfall}
                          </p>
                        </div>
                      </div>

                      {/* Worked Example */}
                      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                            Model Comparison • {ct.example.subject}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--ink)' }}>
                            "{ct.example.question}"
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                            <span style={{ color: '#059669', fontWeight: 700, display: 'block', marginBottom: '2px' }}>✓ 7/7 Markscheme Standard:</span>
                            <span style={{ color: 'var(--ink)', whiteSpace: 'pre-line' }}>{ct.example.goodResponse}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                            <span style={{ color: 'var(--rust)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>✗ 0 or Capped Response:</span>
                            <span style={{ color: 'var(--muted)', whiteSpace: 'pre-line' }}>{ct.example.badResponse}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Rules & Guidelines View */
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="tech-label">[EXAMINER_DISCLOSURE]</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: '0.3rem 0 0.5rem' }}>
                Universal IB Examination Grading Principles
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.92rem', maxWidth: '750px', margin: 0 }}>
                Senior IB examiners grade papers using standardized markscheme conventions. Knowing these four cardinal rules will prevent unnecessary mark deductions on exam day.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <div className="panel" style={{ background: 'var(--panel-light)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rust)', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={18} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>1. The Contradiction Rule</h4>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ink)', lineHeight: '1.5', margin: 0 }}>
                  If a question asks for one fact (1 mark) and a student provides two contradictory statements (e.g. "increases then stays constant, but also decreases"), the mark is <strong>automatically forfeited (0 marks awarded)</strong>. Examiners never give the benefit of the doubt on contradictory answers.
                </p>
              </div>

              <div className="panel" style={{ background: 'var(--panel-light)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>2. Error Carried Forward (ECF)</h4>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ink)', lineHeight: '1.5', margin: 0 }}>
                  In multi-step mathematics and science calculation questions (Papers 1, 2, and 3), if you make an algebraic or arithmetic mistake in part (a), you will lose the accuracy mark for (a). However, if your method in part (b) correctly uses your incorrect value from (a), you receive <strong>full method marks (ECF) for part (b)</strong>. Never leave part (b) blank just because you doubt your answer to (a).
                </p>
              </div>

              <div className="panel" style={{ background: 'var(--panel-light)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '0.5rem' }}>
                  <Layers size={18} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>3. Significant Figures (SF) Penalty</h4>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ink)', lineHeight: '1.5', margin: 0 }}>
                  In Physics, Chemistry, and Mathematics, final numerical answers must generally be rounded to <strong>3 significant figures</strong> unless specified otherwise or exact. An SF penalty (1 mark deduction per paper) is assessed if an answer is given to 1 SF or more than 4 SFs. Store intermediate answers in calculator memory to avoid rounding errors midway!
                </p>
              </div>

              <div className="panel" style={{ background: 'var(--panel-light)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  <Lightbulb size={18} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>4. The "Describe" vs "Explain" Trap</h4>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--ink)', lineHeight: '1.5', margin: 0 }}>
                  Students lose the most marks in Biology and Chemistry by writing explanations when asked to <em>Describe</em> (getting 0 marks for why, missing the data quote), or writing simple observations when asked to <em>Explain</em> (getting capped at 1 mark for not linking cause and consequence with mechanisms).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

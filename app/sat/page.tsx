'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, ExternalLink, Target, FileDown, Sparkles, TrendingUp, Layers, AlertCircle } from 'lucide-react';
import SATReferenceGuideModal from '@/app/components/SATReferenceGuideModal';
import DesmosMasterKeyModal from '@/app/components/DesmosMasterKeyModal';
import { getSkillStats, SkillStat, getMistakeVault, getExamHistory, ExamHistoryEntry, MistakeEntry, getMistakeErrorTagStats } from '@/lib/sat-storage';

const KHAN_RESOURCES = [
  {
    title: 'Reading and Writing — Official Course',
    desc: 'Official College Board lessons covering Craft and Structure, Information and Ideas, and Standard English Conventions.',
    url: 'https://www.khanacademy.org/test-prep/digital-sat-reading-and-writing',
  },
  {
    title: 'Math — Official Course',
    desc: 'Lessons and drills across Algebra, Advanced Math, Problem-Solving and Data Analysis, and Geometry & Trigonometry.',
    url: 'https://www.khanacademy.org/test-prep/digital-sat-math',
  },
];

const YOUTUBE_CURATORS = [
  {
    name: 'Scalar Learning',
    focus: 'Math walkthroughs and timed tests',
    url: 'https://www.youtube.com/@ScalarLearning',
  },
  {
    name: 'PrepPros',
    focus: 'Advanced math problems and grammar rules',
    url: 'https://www.youtube.com/@PrepPros',
  },
  {
    name: 'Tutor Steve',
    focus: 'Desmos workflows and shortcuts',
    url: 'https://www.youtube.com/@TutorSteve',
  },
  {
    name: 'Hayden Rhodea',
    focus: 'Reading and writing review courses',
    url: 'https://www.youtube.com/@HaydenRhodea',
  },
];

const TEXTBOOKS = [
  {
    title: 'Digital SAT Premium Prep (2026 Edition)',
    author: 'The Princeton Review',
    subject: 'Full Prep',
    desc: 'Comprehensive strategy guide with practice drills and test-taking techniques.',
    fileUrl: '/vault/sat-books/Digital_SAT_Premium_Prep_2026_The_Princeton_Review.pdf',
    isLocalPdf: true,
  },
  {
    title: 'SAT Prep Black Book: The Most Effective SAT Strategies',
    author: 'Mike Barrett & Patrick Barrett',
    subject: 'Strategy & Analysis',
    desc: 'Systematic breakdowns of official question design and reasoning patterns.',
    fileUrl: '/vault/sat-books/SAT_Prep_Black_Book_Mike_Barrett.pdf',
    isLocalPdf: true,
  },
  {
    title: 'The Critical Reader',
    author: 'Erica L. Meltzer',
    subject: 'Reading',
    desc: 'Analysis of reading passages, evidence questions, and in-context vocabulary.',
  },
  {
    title: 'The Ultimate Guide to SAT Grammar',
    author: 'Erica L. Meltzer',
    subject: 'Writing',
    desc: 'Guide to clause boundaries, punctuation, modifiers, and transitions.',
  },
  {
    title: 'The College Panda SAT Math',
    author: 'Nielson Phu',
    subject: 'Math',
    desc: 'Problem sets covering quadratics, exponential functions, and coordinate geometry.',
  },
  {
    title: '1600.io SAT Math Orange Book',
    author: 'J. George & G. Walker',
    subject: 'Math',
    desc: 'Foundational topic-by-topic math instruction and proofs.',
  },
];

export default function SATHubPage() {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showDesmosKeyModal, setShowDesmosKeyModal] = useState(false);
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([]);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [skills, setSkills] = useState<SkillStat[]>([]);

  const [errorTagStats, setErrorTagStats] = useState({ concept_gap: 0, examiner_trap: 0, careless_calc: 0, time_pressure: 0 });

  React.useEffect(() => {
    setExamHistory(getExamHistory());
    setMistakes(getMistakeVault());
    setSkills(getSkillStats());
    setErrorTagStats(getMistakeErrorTagStats());
  }, []);
  const weakSkills = skills.filter((s) => s.total >= 3).sort((a, b) => a.correct / a.total - b.correct / b.total).slice(0, 3);

  // Compute weakest domain
  const domainCounts = mistakes.filter(m => !m.mastered && m.domain).reduce((acc, m) => {
    const sec = m.section === 'math' ? 'math' : 'reading-writing';
    const k = `${sec}|${m.domain}`;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weakestDomainEntry = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];
  const [weakestSection, weakestDomain] = weakestDomainEntry ? weakestDomainEntry[0].split('|') : [null, null];

  const latestExam = examHistory[0] || null;
  const totalErrors = errorTagStats.concept_gap + errorTagStats.examiner_trap + errorTagStats.careless_calc + errorTagStats.time_pressure;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="section-label">DIGITAL SAT</span>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>SAT Preparation</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '65ch' }}>
          Adaptive practice tests, skill drills, flashcards, textbooks, and Desmos cheatsheets.
        </p>
      </div>

      {/* EXAM READINESS & SCORE PREDICTOR DASHBOARD (If student has activity) */}
      {(examHistory.length > 0 || mistakes.length > 0) && (
        <div
          className="panel"
          style={{
            padding: '1.75rem 2rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(184, 74, 57, 0.03) 0%, rgba(2, 132, 199, 0.03) 100%)',
            borderColor: 'var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
              <span className="section-label" style={{ margin: 0 }}>
                EXAM READINESS & PREDICTED SCORE TRAJECTORY
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Based on {examHistory.length} adaptive test(s) & {mistakes.length} logged mistake(s)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            {latestExam ? (
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Latest Scaled Test Score
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)', lineHeight: '1.1' }}>
                  {latestExam.totalScore} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted)' }}>/ 1600</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  RW: {latestExam.rwScore} • Math: {latestExam.mathScore} (~{latestExam.percentile}th %ile)
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Readiness Status
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', marginTop: '0.2rem' }}>
                  Targeted Drills Active
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Take a full test to record your official scaled score & performance breakdown.
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>
                Mistake Vault Status
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
                {mistakes.filter(m => !m.mastered).length} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--muted)' }}>unmastered</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {mistakes.filter(m => m.mastered).length} marked mastered
              </div>
            </div>

            {weakestDomain && (
              <div style={{ background: 'var(--panel-light, #ffffff)', border: '1px solid var(--border)', padding: '0.85rem 1.1rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> Priority Weak Spot
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', marginTop: '0.2rem' }}>
                  {weakestDomain}
                </div>
                <Link
                  href={`/sat/practice/drill?section=${weakestSection}&domain=${encodeURIComponent(weakestDomain || '')}`}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    marginTop: '0.35rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  Launch drill for this topic <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {weakSkills.length > 0 && (
        <div className="panel" style={{ padding: '1.4rem 1.75rem', marginBottom: '2.5rem' }}>
          <span className="section-label">YOUR WEAKEST SKILLS</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.6rem' }}>
            {weakSkills.map((w) => (
              <Link key={w.skill} href={`/sat/practice/drill?section=${w.section}&domain=${encodeURIComponent(w.domain)}&skill=${encodeURIComponent(w.skill)}`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', borderRadius: 8, padding: '0.8rem 1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{w.skill}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#b91c1c', marginTop: 4 }}>{Math.round((w.correct / w.total) * 100)}% ({w.correct}/{w.total}) · practice this →</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* METACOGNITIVE ERROR TAXONOMY (Proportional Progress Bars) */}
      {/* MISTAKE BREAKDOWN (Proportional Progress Bars) */}
      <div 
        className="editorial-bento-card" 
        style={{ 
          padding: '1.75rem 2rem', 
          marginBottom: '2.5rem',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>MISTAKE TRACKER</span>
            <h3 style={{ fontSize: '1.35rem', marginTop: '0.2rem', marginBottom: '0.15rem' }}>
              Mistake Breakdown
            </h3>
          </div>
          <Link 
            href="/sat/practice/drill?mode=mistakes" 
            style={{ 
              fontSize: '0.82rem', 
              color: 'var(--accent)', 
              textDecoration: 'none', 
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            Open Mistake Vault ({mistakes.length} items) <ArrowRight size={13} />
          </Link>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: '0 0 1.25rem', maxWidth: '70ch' }}>
          Categorized breakdown of missed questions across drills and practice tests.
        </p>

        {/* Combined Proportional Horizontal Stacked Bar */}
        <div 
          style={{ 
            height: '10px', 
            borderRadius: '9999px', 
            background: 'var(--surface-inset)', 
            display: 'flex', 
            overflow: 'hidden', 
            marginBottom: '1.5rem',
            border: '1px solid var(--border)'
          }}
        >
          {totalErrors > 0 ? (
            <>
              <div style={{ width: `${(errorTagStats.concept_gap / totalErrors) * 100}%`, background: '#0969da', transition: 'width 0.3s ease' }} title={`Concept Gap: ${errorTagStats.concept_gap}`} />
              <div style={{ width: `${(errorTagStats.examiner_trap / totalErrors) * 100}%`, background: '#f59e0b', transition: 'width 0.3s ease' }} title={`Trick Question: ${errorTagStats.examiner_trap}`} />
              <div style={{ width: `${(errorTagStats.careless_calc / totalErrors) * 100}%`, background: '#ef4444', transition: 'width 0.3s ease' }} title={`Careless Error: ${errorTagStats.careless_calc}`} />
              <div style={{ width: `${(errorTagStats.time_pressure / totalErrors) * 100}%`, background: '#8250df', transition: 'width 0.3s ease' }} title={`Time Pressure: ${errorTagStats.time_pressure}`} />
            </>
          ) : (
            <div style={{ width: '100%', background: 'var(--surface-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>No mistakes logged yet</span>
            </div>
          )}
        </div>

        {/* Breakdown Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* 1. Concept Gap */}
          <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0969da' }}>
                Concept Gap
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                {errorTagStats.concept_gap} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({totalErrors > 0 ? Math.round((errorTagStats.concept_gap / totalErrors) * 100) : 0}%)</span>
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(9, 105, 218, 0.12)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ height: '100%', width: `${totalErrors > 0 ? (errorTagStats.concept_gap / totalErrors) * 100 : 0}%`, background: '#0969da', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
              Unfamiliar formula, theorem, or rule
            </div>
          </div>

          {/* 2. Trick Question */}
          <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f59e0b' }}>
                Trick Question
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                {errorTagStats.examiner_trap} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({totalErrors > 0 ? Math.round((errorTagStats.examiner_trap / totalErrors) * 100) : 0}%)</span>
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ height: '100%', width: `${totalErrors > 0 ? (errorTagStats.examiner_trap / totalErrors) * 100 : 0}%`, background: '#f59e0b', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
              Tricky distractor or misleading wording
            </div>
          </div>

          {/* 3. Careless Error */}
          <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ef4444' }}>
                Careless Error
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                {errorTagStats.careless_calc} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({totalErrors > 0 ? Math.round((errorTagStats.careless_calc / totalErrors) * 100) : 0}%)</span>
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(239, 68, 68, 0.12)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ height: '100%', width: `${totalErrors > 0 ? (errorTagStats.careless_calc / totalErrors) * 100 : 0}%`, background: '#ef4444', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
              Arithmetic slip, sign error, or reading misstep
            </div>
          </div>

          {/* 4. Time Pressure */}
          <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#8250df' }}>
                Time Pressure
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                {errorTagStats.time_pressure} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({totalErrors > 0 ? Math.round((errorTagStats.time_pressure / totalErrors) * 100) : 0}%)</span>
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(130, 80, 223, 0.12)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ height: '100%', width: `${totalErrors > 0 ? (errorTagStats.time_pressure / totalErrors) * 100 : 0}%`, background: '#8250df', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
              Rushed pacing near the end of a section
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4 EXAM MODE SELECTOR CARDS
          ========================================================================= */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <div>
            <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>TEST MODES</span>
            <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
              Practice Exam Modes
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0 }}>
              Choose a difficulty mode that matches your study goals.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {/* Mode 1: Standard Adaptive */}
          <Link href="/sat/practice/exam?mode=adaptive" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="editorial-bento-card" style={{ height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="badge" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(194, 65, 12, 0.08)', color: 'var(--accent)' }}>
                    Official Format
                  </span>
                  <span className="badge tabular-nums" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                    All Scores
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Adaptive Exam</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  Standard 2-stage exam. Module 2 adjusts difficulty based on your Module 1 performance.
                </p>

                {/* Difficulty Distribution Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '0.35rem' }}>
                    <span>Difficulty:</span>
                    <span className="tabular-nums">30% E · 45% M · 25% H</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '9999px', background: 'var(--surface-inset)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: '30%', background: '#15803d' }} title="30% Easy" />
                    <div style={{ width: '45%', background: '#d97706' }} title="45% Medium" />
                    <div style={{ width: '25%', background: '#c2410c' }} title="25% Hard" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '0.5rem', color: 'var(--accent)' }}>
                Start Adaptive Exam <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          {/* Mode 2: Medium Tier */}
          <Link href="/sat/practice/exam?mode=medium" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="editorial-bento-card" style={{ height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="badge" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(9, 105, 218, 0.08)', color: '#0969da' }}>
                    Target: 600–700
                  </span>
                  <span className="badge tabular-nums" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                    Medium Focus
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Medium Focus</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  Skips easy questions to focus on building accuracy and speed across core concepts.
                </p>

                {/* Difficulty Distribution Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '0.35rem' }}>
                    <span>Difficulty:</span>
                    <span className="tabular-nums">75% M · 25% H</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '9999px', background: 'var(--surface-inset)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: '75%', background: '#d97706' }} title="75% Medium" />
                    <div style={{ width: '25%', background: '#c2410c' }} title="25% Hard" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '0.5rem', color: '#0969da' }}>
                Start Medium Exam <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          {/* Mode 3: Hard Tier */}
          <Link href="/sat/practice/exam?mode=hard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="editorial-bento-card" style={{ height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="badge" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(130, 80, 223, 0.08)', color: '#8250df' }}>
                    Target: 700+
                  </span>
                  <span className="badge tabular-nums" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                    Hard Focus
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Hard Focus</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  Locks Module 2 to hard questions to prepare for high-scoring exams.
                </p>

                {/* Difficulty Distribution Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '0.35rem' }}>
                    <span>Difficulty:</span>
                    <span className="tabular-nums">25% M · 75% H</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '9999px', background: 'var(--surface-inset)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: '25%', background: '#d97706' }} title="25% Medium" />
                    <div style={{ width: '75%', background: '#8250df' }} title="75% Hard" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '0.5rem', color: '#8250df' }}>
                Start Hard Exam <ArrowRight size={13} />
              </div>
            </div>
          </Link>

          {/* Mode 4: 750+ Hard Only */}
          <Link href="/sat/practice/exam?mode=hard_gauntlet" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="editorial-bento-card" style={{ height: '100%', borderColor: 'rgba(194, 65, 12, 0.35)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="badge" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--accent)', color: '#ffffff' }}>
                    Target: 750+
                  </span>
                  <span className="badge tabular-nums" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                    Hard Only
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Hard Only</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  100% hard questions across both modules. Designed for high scorers looking for a challenge.
                </p>

                {/* Difficulty Distribution Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '0.35rem' }}>
                    <span>Difficulty:</span>
                    <span className="tabular-nums" style={{ color: 'var(--accent)', fontWeight: 700 }}>100% Hard</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '9999px', background: 'var(--surface-inset)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: '100%', background: 'var(--accent)' }} title="100% Hard" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '0.5rem', color: 'var(--accent)' }}>
                Start Hard Only <ArrowRight size={13} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Auxiliary Gateways: Targeted Drills, Mistake Vault, Flashcards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {/* Targeted Drill Card */}
        <Link href="/sat/practice/drill" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="editorial-bento-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span className="section-label" style={{ color: 'var(--accent)', margin: 0 }}>
                  PRACTICE DRILLS
                </span>
                <Target size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Targeted Practice</h3>
              <p style={{ color: 'var(--card-desc, #57534E)', fontSize: '0.86rem', lineHeight: '1.45' }}>
                Practice by domain, skill, and difficulty with instant explanations and Desmos shortcuts.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1rem', color: 'var(--ink)' }}>
              Start Drill <ArrowRight size={13} />
            </div>
          </div>
        </Link>

        {/* Mistake Vault Card */}
        <Link href="/sat/practice/drill?mode=mistakes" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="editorial-bento-card" style={{ borderColor: 'rgba(194, 65, 12, 0.25)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span className="section-label" style={{ color: 'var(--accent)', margin: 0 }}>
                  WEAK-SPOT NOTEBOOK
                </span>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Mistake Vault</h3>
              <p style={{ color: 'var(--card-desc, #57534E)', fontSize: '0.86rem', lineHeight: '1.45' }}>
                Review and re-test only the questions you got wrong on past tests until 100% mastered.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1rem', color: 'var(--accent)' }}>
              Open Mistake Vault ({mistakes.length}) <ArrowRight size={13} />
            </div>
          </div>
        </Link>

        {/* Active-Recall Flashcards Card */}
        <Link href="/flashcards" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="editorial-bento-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span className="section-label" style={{ color: '#0969da', margin: 0 }}>
                  ACTIVE RECALL
                </span>
                <Layers size={18} style={{ color: '#0969da' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Memory Flashcards</h3>
              <p style={{ color: 'var(--card-desc, #57534E)', fontSize: '0.86rem', lineHeight: '1.45' }}>
                3D flip-cards for punctuation rules, circle theorems, Vieta’s formulas, and algebra models.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1rem', color: '#0969da' }}>
              Study Flashcards <ArrowRight size={13} />
            </div>
          </div>
        </Link>
      </div>

      {/* Reference Bar */}
      <div
        className="panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.75rem',
          marginBottom: '3.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <BookOpen size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--ink)' }}>SAT Formulae, Desmos & English Conventions</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              Complete math formulas, Desmos shortcuts, special triangles, circle equations, and grammar rules.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-ref-outline"
            onClick={() => setShowDesmosKeyModal(true)}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Desmos Shortcuts
          </button>

          <button
            type="button"
            className="btn-ref-primary"
            onClick={() => setShowFormulaModal(true)}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={14} /> Open Reference Sheet
          </button>
        </div>
      </div>

      {/* Textbooks & PDF Vault */}
      <div className="editorial-section">
        <span className="section-label">TEXTBOOKS & STRATEGY GUIDES</span>
        <h2>Prep Books</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Selected reference books and guides.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {TEXTBOOKS.map((tb) => (
            <div key={tb.title} className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--muted)',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
                  {tb.subject} • {tb.author}
                </span>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{tb.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--card-desc, #52525b)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  {tb.desc}
                </p>
              </div>

              {tb.fileUrl ? (
                <a
                  href={tb.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="resource-link"
                  style={{ fontSize: '0.82rem', color: 'var(--accent)', borderBottomColor: 'var(--accent)' }}
                >
                  <FileDown size={14} /> Open Book PDF
                </a>
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
                  Standard Edition
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Khan Academy Modules */}
      <div className="editorial-section">
        <span className="section-label">COURSES</span>
        <h2>Khan Academy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {KHAN_RESOURCES.map((res) => (
            <div key={res.title} className="panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{res.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                {res.desc}
              </p>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="resource-link"
              >
                Khan Academy Course <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Video Channels */}
      <div className="editorial-section">
        <span className="section-label">VIDEO RESOURCES</span>
        <h2>Video Walkthroughs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
          {YOUTUBE_CURATORS.map((yt) => (
            <div key={yt.name} className="panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{yt.name}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.85rem' }}>
                {yt.focus}
              </div>
              <a
                href={yt.url}
                target="_blank"
                rel="noreferrer"
                className="resource-link"
              >
                YouTube Channel <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* REFERENCE GUIDE MODAL */}
      <SATReferenceGuideModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
      />

      {/* DESMOS MASTER KEY MODAL */}
      <DesmosMasterKeyModal
        isOpen={showDesmosKeyModal}
        onClose={() => setShowDesmosKeyModal(false)}
      />
    </div>
  );
}

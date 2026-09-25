'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  ExternalLink,
  Target,
  Clock,
  Calculator,
  FileDown,
  Sparkles,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import SATReferenceGuideModal from '@/app/components/SATReferenceGuideModal';
import DesmosMasterKeyModal from '@/app/components/DesmosMasterKeyModal';
import { getMistakeVault, getExamHistory, ExamHistoryEntry, MistakeEntry } from '@/lib/sat-storage';

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

  React.useEffect(() => {
    setExamHistory(getExamHistory());
    setMistakes(getMistakeVault());
  }, []);

  // Compute weakest domain
  const domainCounts = mistakes.filter(m => !m.mastered).reduce((acc, m) => {
    acc[m.domain] = (acc[m.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weakestDomainEntry = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];
  const weakestDomain = weakestDomainEntry ? weakestDomainEntry[0] : null;

  const latestExam = examHistory[0] || null;

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
                  href={`/sat/practice/drill?mode=standard`}
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

      {/* Main Gateways (4-card grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Full Exam Card */}
        <Link href="/sat/practice/exam" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="portal-card"
            style={{
              padding: '1.75rem',
              borderColor: 'var(--rust)',
              background: 'rgba(184, 74, 57, 0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="section-label" style={{ color: 'var(--rust)', margin: 0 }}>
                  ADAPTIVE SIMULATION
                </span>
                <Clock size={18} style={{ color: 'var(--rust)' }} />
              </div>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Full Practice Test</h2>
              <p style={{ color: 'var(--card-desc, #52525b)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Timed 4-module test with adaptive difficulty routing, Desmos calculator, and score report.
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: 'var(--rust)', borderBottomColor: 'var(--rust)' }}>
              Start Full Exam <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </div>
          </div>
        </Link>

        {/* Targeted Drill Card */}
        <Link href="/sat/practice/drill" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="portal-card"
            style={{
              padding: '1.75rem',
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="section-label" style={{ color: 'var(--accent)', margin: 0 }}>
                  PRACTICE DRILLS
                </span>
                <Target size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Targeted Practice</h2>
              <p style={{ color: 'var(--card-desc, #52525b)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Practice by domain, skill, and difficulty with instant explanations and Desmos shortcuts.
              </p>
            </div>
            <div className="portal-card-arrow">
              Start Practice <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </div>
          </div>
        </Link>

        {/* Mistake Vault Card */}
        <Link href="/sat/practice/drill?mode=mistakes" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="portal-card"
            style={{
              padding: '1.75rem',
              borderColor: 'var(--accent)',
              background: 'rgba(184, 74, 57, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="section-label" style={{ color: 'var(--accent)', margin: 0 }}>
                  WEAK-SPOT NOTEBOOK
                </span>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Mistake Vault</h2>
              <p style={{ color: 'var(--card-desc, #52525b)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Review and re-test only the questions you got wrong on past tests until 100% mastered.
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: 'var(--accent)', borderBottomColor: 'var(--accent)' }}>
              Open Mistake Vault ({mistakes.length}) <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </div>
          </div>
        </Link>

        {/* Active-Recall Flashcards Card */}
        <Link href="/flashcards" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="portal-card"
            style={{
              padding: '1.75rem',
              borderColor: 'var(--border)',
              background: 'rgba(2, 132, 199, 0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="section-label" style={{ color: '#0284c7', margin: 0 }}>
                  ACTIVE RECALL
                </span>
                <Layers size={18} style={{ color: '#0284c7' }} />
              </div>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Memory Flashcards</h2>
              <p style={{ color: 'var(--card-desc, #52525b)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                3D flip-cards for punctuation rules, circle theorems, Vieta’s formulas, and algebra models.
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: '#0284c7', borderBottomColor: '#0284c7' }}>
              Study Flashcards <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
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

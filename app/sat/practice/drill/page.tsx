'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { SATQuestion, SATTaxonomy } from '@/lib/sat';
import MathView from '@/app/components/MathView';
import SATReferenceGuideModal from '@/app/components/SATReferenceGuideModal';
import DesmosMasterKeyModal from '@/app/components/DesmosMasterKeyModal';
import PrintableWorksheetModal from '@/app/components/PrintableWorksheetModal';
import DesmosVisualPreview from '@/app/components/DesmosVisualPreview';
import { getDesmosShortcutForQuestion } from '@/lib/desmos-shortcuts';
import {
  saveMistake,
  getMistakeVault,
  markMistakeMastered,
  removeMistake,
  clearMistakeVault,
  MistakeEntry,
} from '@/lib/sat-storage';

export default function SATTargetedDrillPage() {
  const [drillMode, setDrillMode] = useState<'standard' | 'mistakes'>('standard');
  const [mistakeList, setMistakeList] = useState<MistakeEntry[]>([]);
  const [showDesmosKeyModal, setShowDesmosKeyModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copiedDesmos, setCopiedDesmos] = useState(false);
  const [section, setSection] = useState<'reading-writing' | 'math'>('reading-writing');
  const [domain, setDomain] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [randomize, setRandomize] = useState(true);
  const [showRefModal, setShowRefModal] = useState(false);

  const [questions, setQuestions] = useState<SATQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [taxonomy, setTaxonomy] = useState<{ rw: SATTaxonomy | null; math: SATTaxonomy | null }>({
    rw: null,
    math: null,
  });

  // User interaction per question
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userSubmittedAnswer, setUserSubmittedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [strikeThroughs, setStrikeThroughs] = useState<Record<string, boolean>>({});

  // Score stats in session
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const DEFAULT_RW_DOMAINS = [
    'Information and Ideas',
    'Craft and Structure',
    'Expression of Ideas',
    'Standard English Conventions',
  ];

  const DEFAULT_MATH_DOMAINS = [
    'Algebra',
    'Advanced Math',
    'Problem-Solving and Data Analysis',
    'Geometry and Trigonometry',
  ];

  // Available domains for current section
  const availableDomains = useMemo(() => {
    const tax = section === 'reading-writing' ? taxonomy.rw : taxonomy.math;
    if (tax && tax.domains && tax.domains.length > 0) {
      return tax.domains.map((d) => d.domain);
    }
    return section === 'reading-writing' ? DEFAULT_RW_DOMAINS : DEFAULT_MATH_DOMAINS;
  }, [section, taxonomy]);

  const mistakesRWCount = useMemo(() => mistakeList.filter((m) => m.section === 'reading-writing').length, [mistakeList]);
  const mistakesMathCount = useMemo(() => mistakeList.filter((m) => m.section === 'math').length, [mistakeList]);

  // Load mistakes and query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'mistakes') {
        setDrillMode('mistakes');
      }
      setMistakeList(getMistakeVault());
    }
  }, []);

  // Fetch questions with race condition cancellation guard
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const loadData = async () => {
      setLoading(true);
      setFetchError(null);
      setCurrentIndex(0);
      setIsSubmitted(false);
      setSelectedAnswer('');
      setUserSubmittedAnswer('');
      setShowRationale(false);
      setStrikeThroughs({});

      if (drillMode === 'mistakes') {
        const vault = getMistakeVault();
        setMistakeList(vault);
        const filtered = vault.filter((m) => m.section === section);
        const formattedQuestions: SATQuestion[] = filtered.map((m) => ({
          questionId: m.questionId,
          pageNumber: 1,
          exam: 'Digital SAT',
          domain: m.domain,
          skill: m.skill || '',
          difficulty: (m.difficulty as any) || 'Medium',
          broadArchetype: '',
          conceptLabel: '',
          prompt: m.prompt,
          choices: m.choices || [],
          correctAnswer: m.correctAnswer,
          rationale: m.rationale,
        }));
        if (!ignore) {
          setQuestions(formattedQuestions);
          setTotalCount(formattedQuestions.length);
          setLoading(false);
        }
        return;
      }

      try {
        const params = new URLSearchParams();
        params.set('section', section);
        if (domain) params.set('domain', domain);
        if (difficulty) params.set('difficulty', difficulty);
        params.set('limit', '50');
        if (randomize) params.set('randomize', 'true');
        params.set('hasChoicesOnly', section === 'math' ? 'false' : 'true');

        const res = await fetch(`/api/sat/questions?${params.toString()}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!ignore && data.success) {
          setQuestions(data.questions || []);
          setTotalCount(data.total || 0);
          if (data.taxonomy) {
            setTaxonomy(data.taxonomy);
          }
        } else if (!ignore) {
          throw new Error(data.error || 'Failed to parse questions response');
        }
      } catch (e: any) {
        if (!ignore) {
          if (e.name === 'AbortError') {
            setFetchError('Request timed out while loading questions. Please retry.');
          } else {
            console.error('Failed to load drill questions', e);
            setFetchError(e.message || 'Failed to connect to question bank.');
          }
        }
      } finally {
        clearTimeout(timeoutId);
        if (!ignore) setLoading(false);
      }
    };

    loadData();

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [section, domain, difficulty, randomize, drillMode, retryCount]);

  const currentQ = questions[currentIndex] || null;
  const desmosShortcut = useMemo(() => {
    return currentQ ? getDesmosShortcutForQuestion(currentQ) : null;
  }, [currentQ]);

  // Check correctness & auto-save to Mistake Vault
  const handleCheckAnswer = () => {
    if (!currentQ || isSubmitted) return;
    setIsSubmitted(true);
    setShowRationale(true);

    const isMultipleChoice = currentQ.choices && currentQ.choices.length > 0;
    let isCorrect = false;

    if (isMultipleChoice) {
      isCorrect = selectedAnswer.toUpperCase() === currentQ.correctAnswer.trim().toUpperCase();
    } else {
      isCorrect = userSubmittedAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    }

    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      if (drillMode === 'mistakes') {
        markMistakeMastered(currentQ.questionId, true);
        setMistakeList(getMistakeVault());
      }
    } else {
      // Auto-save incorrect question into Mistake Vault
      saveMistake({
        questionId: currentQ.questionId,
        section,
        domain: currentQ.domain,
        skill: currentQ.skill,
        difficulty: currentQ.difficulty,
        prompt: currentQ.prompt,
        choices: currentQ.choices,
        correctAnswer: currentQ.correctAnswer,
        userAnswer: isMultipleChoice ? selectedAnswer : userSubmittedAnswer || '[Blank]',
        rationale: currentQ.rationale,
      });
      setMistakeList(getMistakeVault());
    }
  };

  const handleRemoveFromVault = (qId: string) => {
    removeMistake(qId);
    const updated = getMistakeVault();
    setMistakeList(updated);
    if (drillMode === 'mistakes') {
      const filtered = updated.filter((m) => m.section === section);
      setQuestions(filtered.map((m) => ({
        questionId: m.questionId,
        pageNumber: 1,
        exam: 'Digital SAT',
        section: m.section,
        domain: m.domain,
        skill: m.skill || '',
        difficulty: m.difficulty as 'Easy' | 'Medium' | 'Hard',
        broadArchetype: m.domain,
        conceptLabel: m.skill || '',
        prompt: m.prompt,
        choices: m.choices || [],
        correctAnswer: m.correctAnswer,
        rationale: m.rationale,
      })));
      if (currentIndex >= filtered.length) {
        setCurrentIndex(Math.max(0, filtered.length - 1));
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsSubmitted(false);
      setSelectedAnswer('');
      setUserSubmittedAnswer('');
      setShowRationale(false);
      setStrikeThroughs({});
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsSubmitted(false);
      setSelectedAnswer('');
      setUserSubmittedAnswer('');
      setShowRationale(false);
      setStrikeThroughs({});
    }
  };

  const toggleStrike = (choiceKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStrikeThroughs((prev) => ({
      ...prev,
      [choiceKey]: !prev[choiceKey],
    }));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Top Breadcrumb & Session Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          href="/sat"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to SAT Portal
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'var(--panel-light, #fff)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={13} />
              <span>Print Worksheet / PDF ({questions.length})</span>
            </button>
          )}

          {answeredCount > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', background: 'var(--panel-light, #fff)', color: 'var(--muted)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px' }}>
              Session Accuracy: <strong style={{ color: 'var(--ink)' }}>{correctCount}/{answeredCount}</strong> ({Math.round((correctCount / answeredCount) * 100)}%)
            </div>
          )}
        </div>
      </div>

      {/* Mode Switch Tabs: Standard Drill vs Mistake Vault */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setDrillMode('standard'); }}
          className={`filter-btn ${drillMode === 'standard' ? 'active' : ''}`}
          style={{ fontSize: '0.92rem', paddingBottom: '0.6rem' }}
        >
          <SlidersHorizontal size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Standard Domain Drills
        </button>

        <button
          type="button"
          onClick={() => { setDrillMode('mistakes'); }}
          className={`filter-btn ${drillMode === 'mistakes' ? 'active' : ''}`}
          style={{ fontSize: '0.92rem', paddingBottom: '0.6rem', color: drillMode === 'mistakes' ? 'var(--accent)' : 'inherit' }}
        >
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Mistake Vault ({mistakeList.length})
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Section Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {drillMode === 'standard' ? (
              <>
                <button
                  type="button"
                  onClick={() => { setSection('reading-writing'); setDomain(''); }}
                  className={`filter-btn ${section === 'reading-writing' ? 'active' : ''}`}
                  style={{ fontSize: '0.88rem', padding: '0.35rem 0.6rem' }}
                >
                  Reading & Writing (1,688)
                </button>
                <button
                  type="button"
                  onClick={() => { setSection('math'); setDomain(''); }}
                  className={`filter-btn ${section === 'math' ? 'active' : ''}`}
                  style={{ fontSize: '0.88rem', padding: '0.35rem 0.6rem' }}
                >
                  Mathematics (1,684)
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setSection('reading-writing'); setDomain(''); }}
                  className={`filter-btn ${section === 'reading-writing' ? 'active' : ''}`}
                  style={{ fontSize: '0.88rem', padding: '0.35rem 0.6rem' }}
                >
                  Reading & Writing Mistakes ({mistakesRWCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setSection('math'); setDomain(''); }}
                  className={`filter-btn ${section === 'math' ? 'active' : ''}`}
                  style={{ fontSize: '0.88rem', padding: '0.35rem 0.6rem' }}
                >
                  Mathematics Mistakes ({mistakesMathCount})
                </button>
              </>
            )}
          </div>

          {/* Domain & Difficulty Dropdowns / Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {drillMode === 'standard' ? (
              <>
                {availableDomains.length > 0 && (
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="select-input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  >
                    <option value="">All Domains</option>
                    {availableDomains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="select-input"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <button
                  type="button"
                  onClick={() => setRandomize((prev) => !prev)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Shuffle</span>
                </button>
              </>
            ) : (
              mistakeList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all mistakes from your vault?')) {
                      clearMistakeVault();
                      setMistakeList([]);
                      setQuestions([]);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: 'var(--rust)',
                  }}
                >
                  Clear Mistake Vault
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Question Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--rust)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading questions from question bank...</p>
        </div>
      ) : fetchError ? (
        <div className="panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <XCircle size={44} style={{ color: 'var(--rust)', margin: '0 auto 1rem', opacity: 0.9 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            Unable to Retrieve Questions
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            {fetchError}
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((prev) => prev + 1)}
            className="filter-btn active"
            style={{ padding: '0.6rem 1.4rem', borderRadius: '6px', background: 'var(--rust)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Retry Loading Questions
          </button>
        </div>
      ) : !currentQ ? (
        drillMode === 'mistakes' ? (
          mistakeList.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
              <Sparkles size={48} style={{ color: 'var(--rust)', margin: '0 auto 1.25rem', opacity: 0.8 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                Your Mistake Vault is Clean
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem', lineHeight: '1.5' }}>
                You haven't missed any questions yet! When you practice standard domain drills or take full-length adaptive SAT tests, any questions you answer incorrectly will automatically be captured here so you can re-test yourself until you achieve 100% mastery.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { setDrillMode('standard'); setSection('reading-writing'); }}
                  style={{ padding: '0.65rem 1.3rem', borderRadius: '10px', background: 'var(--accent)', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Start Reading & Writing Drills
                </button>
                <button
                  type="button"
                  onClick={() => { setDrillMode('standard'); setSection('math'); }}
                  style={{ padding: '0.65rem 1.3rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Start Math Drills
                </button>
              </div>
            </div>
          ) : (
            <div className="panel" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
              <CheckCircle2 size={48} style={{ color: '#059669', margin: '0 auto 1.25rem', opacity: 0.8 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                No Mistakes in {section === 'reading-writing' ? 'Reading & Writing' : 'Mathematics'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem', lineHeight: '1.5' }}>
                You have zero active mistakes in this section! You currently have {section === 'reading-writing' ? mistakesMathCount : mistakesRWCount} mistake{(section === 'reading-writing' ? mistakesMathCount : mistakesRWCount) === 1 ? '' : 's'} logged in {section === 'reading-writing' ? 'Mathematics' : 'Reading & Writing'}.
              </p>
              <button
                type="button"
                onClick={() => setSection(section === 'reading-writing' ? 'math' : 'reading-writing')}
                style={{ padding: '0.65rem 1.3rem', borderRadius: '10px', background: 'var(--accent)', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Switch to {section === 'reading-writing' ? 'Mathematics' : 'Reading & Writing'}
              </button>
            </div>
          )
        ) : (
          <div className="panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h3>No questions match this filter combination</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Try resetting the domain or difficulty filter to view questions.
            </p>
            <button
              type="button"
              onClick={() => { setDomain(''); setDifficulty(''); }}
              style={{
                padding: '0.65rem 1.3rem',
                background: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        )
      ) : (
        <div className="panel" style={{ padding: '2.5rem' }}>
          {/* Question Header Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                ID: {currentQ.questionId}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(28,28,30,0.04)',
                  color: 'var(--ink)',
                }}
              >
                {currentQ.domain} • {currentQ.skill}
              </span>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  background:
                    currentQ.difficulty === 'Hard'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : currentQ.difficulty === 'Medium'
                      ? 'rgba(234, 179, 8, 0.1)'
                      : 'rgba(16, 185, 129, 0.1)',
                  color:
                    currentQ.difficulty === 'Hard'
                      ? '#b91c1c'
                      : currentQ.difficulty === 'Medium'
                      ? '#b45309'
                      : '#047857',
                }}
              >
                {currentQ.difficulty.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Prompt */}
          <div
            style={{
              fontSize: '1.08rem',
              lineHeight: '1.7',
              marginBottom: '2rem',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'pre-wrap',
            }}
          >
            <MathView content={currentQ.prompt} />
          </div>

          {/* Choices or Free-Response Input */}
          {currentQ.choices && currentQ.choices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {currentQ.choices.map((choiceText, idx) => {
                const choiceLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswer === choiceLetter;
                const isCorrectChoice = currentQ.correctAnswer.trim().toUpperCase() === choiceLetter;
                const isStruck = strikeThroughs[choiceLetter];

                let borderColor = 'var(--border)';
                let bgColor = '#fff';

                if (isSubmitted) {
                  if (isCorrectChoice) {
                    borderColor = '#059669';
                    bgColor = 'rgba(16, 185, 129, 0.05)';
                  } else if (isSelected && !isCorrectChoice) {
                    borderColor = '#dc2626';
                    bgColor = 'rgba(239, 68, 68, 0.05)';
                  }
                } else if (isSelected) {
                  borderColor = 'var(--ink)';
                  bgColor = 'rgba(28, 28, 30, 0.03)';
                }

                return (
                  <div
                    key={choiceLetter}
                    onClick={() => {
                      if (!isSubmitted) setSelectedAnswer(choiceLetter);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '6px',
                      border: `1px solid ${borderColor}`,
                      background: bgColor,
                      cursor: isSubmitted ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isStruck && !isSubmitted ? 0.45 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: isSelected ? '1px solid var(--ink)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--ink)' : '#fff',
                          color: isSelected ? '#fff' : 'var(--ink)',
                        }}
                      >
                        {choiceLetter}
                      </span>
                      <span
                        style={{
                          fontSize: '0.96rem',
                          textDecoration: isStruck && !isSubmitted ? 'line-through' : 'none',
                        }}
                      >
                        <MathView content={choiceText || `[Choice ${choiceLetter}]`} />
                      </span>
                    </div>

                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={(e) => toggleStrike(choiceLetter, e)}
                        title="Strike out choice"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--muted)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '0.2rem 0.5rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {isStruck ? 'Unstrike' : 'Strikethrough'}
                      </button>
                    )}

                    {isSubmitted && isCorrectChoice && (
                      <CheckCircle2 size={18} style={{ color: '#059669' }} />
                    )}
                    {isSubmitted && isSelected && !isCorrectChoice && (
                      <XCircle size={18} style={{ color: '#dc2626' }} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Student-Produced Response (SPR) Input */
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                STUDENT PRODUCED RESPONSE (GRID-IN):
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="Enter number or fraction..."
                  value={userSubmittedAnswer}
                  onChange={(e) => setUserSubmittedAnswer(e.target.value)}
                  disabled={isSubmitted}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-mono)',
                    width: '100%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-light, #fff)',
                  color: 'var(--ink)',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex === 0 ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem',
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-light, #fff)',
                  color: 'var(--ink)',
                  cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex === questions.length - 1 ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem',
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {section === 'math' && (
                <button
                  type="button"
                  onClick={() => setShowDesmosKeyModal(true)}
                  style={{
                    padding: '0.65rem 1rem',
                    background: 'var(--panel-light, #fff)',
                    color: 'var(--ink)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Desmos Shortcuts
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowRefModal(true)}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'var(--panel-light, #fff)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <BookOpen size={14} /> Reference Guide
              </button>

              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer && !userSubmittedAnswer.trim()}
                  style={{
                    padding: '0.65rem 1.4rem',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: !selectedAnswer && !userSubmittedAnswer.trim() ? 'not-allowed' : 'pointer',
                    opacity: !selectedAnswer && !userSubmittedAnswer.trim() ? 0.5 : 1,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRationale(!showRationale)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'var(--panel-light, #fff)',
                    color: 'var(--ink)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {showRationale ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showRationale ? 'Hide Rationale' : 'View Rationale'}</span>
                </button>
              )}
            </div>
          </div>

          {/* RATIONALE DRAWER */}
          {isSubmitted && showRationale && (
            <div
              style={{
                marginTop: '1.75rem',
                padding: '1.5rem',
                borderRadius: '6px',
                background: 'rgba(28, 28, 30, 0.02)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <HelpCircle size={16} style={{ color: 'var(--accent)' }} />
                <span className="section-label" style={{ margin: 0 }}>
                  OFFICIAL COLLEGE BOARD RATIONALE
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--ink)' }}>
                Correct Answer: {currentQ.correctAnswer}
              </div>

              <div style={{ fontSize: '0.94rem', lineHeight: '1.65', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                <MathView content={currentQ.rationale || 'No extended rationale provided.'} />
              </div>

              {/* Contextual Desmos Shortcut Method for Math */}
              {section === 'math' && desmosShortcut && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    borderRadius: '6px',
                    background: 'rgba(2, 132, 199, 0.05)',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontWeight: 600, fontSize: '0.92rem' }}>
                      <Sparkles size={16} />
                      <span>{desmosShortcut.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(desmosShortcut.desmosCode);
                        setCopiedDesmos(true);
                        setTimeout(() => setCopiedDesmos(false), 2000);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.35rem 0.7rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: 'var(--panel-light, #fff)',
                        color: 'var(--ink)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedDesmos ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />}
                      <span>{copiedDesmos ? 'Copied Syntax!' : 'Copy Desmos Syntax'}</span>
                    </button>
                  </div>

                  <div style={{ background: 'var(--panel-light, #f8fafc)', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid rgba(2, 132, 199, 0.25)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {desmosShortcut.desmosCode}
                  </div>

                  <div style={{ margin: '0.85rem 0' }}>
                    <DesmosVisualPreview id={desmosShortcut.id} />
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--ink)', lineHeight: '1.6', marginBottom: '0.6rem' }}>
                    <strong>Step-by-Step Desmos Execution:</strong>
                    <ol style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                      {desmosShortcut.stepByStep.map((s, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>
                      ))}
                    </ol>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#0369a1', fontStyle: 'italic', background: 'rgba(2, 132, 199, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                    💡 <strong>Pro Tip:</strong> {desmosShortcut.proTip}
                  </div>
                </div>
              )}
            </div>
          )}

          <SATReferenceGuideModal
            isOpen={showRefModal}
            onClose={() => setShowRefModal(false)}
            defaultTab={section === 'math' ? 'math' : 'english'}
          />

          <DesmosMasterKeyModal
            isOpen={showDesmosKeyModal}
            onClose={() => setShowDesmosKeyModal(false)}
          />

          <PrintableWorksheetModal
            isOpen={showPrintModal}
            onClose={() => setShowPrintModal(false)}
            questions={questions}
            title={drillMode === 'mistakes' ? 'Mistake Vault Review Worksheet' : `${section === 'math' ? 'Mathematics' : 'Reading & Writing'} Practice Worksheet`}
            subtitle={domain ? `Focused Domain: ${domain}` : 'Official College Board Problem Suite'}
          />
        </div>
      )}
    </div>
  );
}

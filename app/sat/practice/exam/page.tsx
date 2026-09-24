'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Calculator,
  FileText,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Play,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { FullSATExam, FullSATExamModule, SATQuestion } from '@/lib/sat';
import MathView from '@/app/components/MathView';
import SATReferenceGuideModal from '@/app/components/SATReferenceGuideModal';
import DesmosMasterKeyModal from '@/app/components/DesmosMasterKeyModal';
import {
  saveMistake,
  saveCompletedExam,
  getExamHistory,
  ExamHistoryEntry,
} from '@/lib/sat-storage';

type ExamState = 'intro' | 'active' | 'module_review' | 'score_report';

const STORAGE_KEY = 'sat_in_progress_exam_v2';

export default function FullSATExamSimulator() {
  const [exam, setExam] = useState<FullSATExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState<ExamState>('intro');

  // Resume state detection
  const [hasSavedExam, setHasSavedExam] = useState(false);
  const [savedExamMeta, setSavedExamMeta] = useState<{
    moduleName: string;
    questionNum: number;
    timeRemaining: string;
    lastSaved: string;
  } | null>(null);

  // Active module & question indices
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // User responses & flags
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Adaptive tiers tracking
  const [isRWHard, setIsRWHard] = useState<boolean>(false);
  const [isMathHard, setIsMathHard] = useState<boolean>(false);
  const [m1RWRaw, setM1RWRaw] = useState<number>(0);
  const [m1MathRaw, setM1MathRaw] = useState<number>(0);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(32 * 60);
  const [showTimer, setShowTimer] = useState(true);

  // Modals
  const [showDesmosModal, setShowDesmosModal] = useState(false);
  const [showDesmosKeyModal, setShowDesmosKeyModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showNavGridModal, setShowNavGridModal] = useState(false);

  // Pacing Diagnostics
  const [questionTimeMap, setQuestionTimeMap] = useState<Record<string, number>>({});
  const questionStartTimeRef = React.useRef<number>(Date.now());
  const [pastExamHistory, setPastExamHistory] = useState<ExamHistoryEntry[]>([]);
  const [pacingAnalysis, setPacingAnalysis] = useState<{
    avgRWSeconds: number;
    avgMathSeconds: number;
    rushedCount: number;
    optimalCount: number;
    overtimeCount: number;
  } | null>(null);

  // Final score
  const [finalScore, setFinalScore] = useState<{
    totalScore: number;
    rwScore: number;
    mathScore: number;
    percentile: number;
    rwCorrect: number;
    mathCorrect: number;
    totalRW: number;
    totalMath: number;
  } | null>(null);

  // Check for saved exam in localStorage on mount
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(STORAGE_KEY);
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (saved && saved.exam && saved.examState === 'active') {
          const mod = saved.exam.modules[saved.currentModuleIdx || 0];
          const mins = Math.floor((saved.secondsRemaining || 0) / 60);
          const secs = (saved.secondsRemaining || 0) % 60;
          setHasSavedExam(true);
          setSavedExamMeta({
            moduleName: mod ? mod.title : 'In-Progress Section',
            questionNum: (saved.currentQuestionIdx || 0) + 1,
            timeRemaining: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
            lastSaved: new Date(saved.lastSaved || Date.now()).toLocaleTimeString(),
          });
        }
      }
    } catch (e) {
      console.warn('Could not inspect saved exam', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save progress periodically & on state changes
  useEffect(() => {
    if (examState !== 'active' || !exam) return;
    try {
      const payload = {
        exam,
        examState,
        currentModuleIdx,
        currentQuestionIdx,
        userAnswers,
        flaggedQuestions,
        secondsRemaining,
        isRWHard,
        isMathHard,
        m1RWRaw,
        m1MathRaw,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // storage quota or private browsing
    }
  }, [examState, exam, currentModuleIdx, currentQuestionIdx, userAnswers, flaggedQuestions, secondsRemaining, isRWHard, isMathHard, m1RWRaw, m1MathRaw]);

  // Resume saved exam
  const handleResumeSavedExam = () => {
    try {
      const savedStr = localStorage.getItem(STORAGE_KEY);
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        setExam(saved.exam);
        setCurrentModuleIdx(saved.currentModuleIdx || 0);
        setCurrentQuestionIdx(saved.currentQuestionIdx || 0);
        setUserAnswers(saved.userAnswers || {});
        setFlaggedQuestions(saved.flaggedQuestions || {});
        setSecondsRemaining(saved.secondsRemaining || 32 * 60);
        setIsRWHard(Boolean(saved.isRWHard));
        setIsMathHard(Boolean(saved.isMathHard));
        setM1RWRaw(Number(saved.m1RWRaw) || 0);
        setM1MathRaw(Number(saved.m1MathRaw) || 0);
        setExamState('active');
        return;
      }
    } catch (e) {
      console.error('Failed to resume exam', e);
    }
    handleStartFreshExam();
  };

  // Start a fresh, randomized exam
  const handleStartFreshExam = async () => {
    setLoading(true);
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedExam(false);
    setUserAnswers({});
    setFlaggedQuestions({});
    setFinalScore(null);

    try {
      const res = await fetch('/api/sat/exam');
      const data = await res.json();
      if (data.success && data.exam) {
        setExam(data.exam);
        setCurrentModuleIdx(0);
        setCurrentQuestionIdx(0);
        setSecondsRemaining(data.exam.modules[0].timeMinutes * 60);
        setExamState('active');
      }
    } catch (err) {
      console.error('Failed to start fresh exam', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (examState !== 'active') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExamState('module_review');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, currentModuleIdx]);

  const currentModule = exam?.modules[currentModuleIdx] || null;
  const currentQuestion = currentModule?.questions[currentQuestionIdx] || null;
  const currentKey = currentModule && currentQuestion ? `${currentModule.id}_${currentQuestion.questionId}` : '';

  const handleSelectAnswer = (ans: string) => {
    if (!currentKey) return;
    setUserAnswers((prev) => ({ ...prev, [currentKey]: ans }));
  };

  const toggleFlag = () => {
    if (!currentKey) return;
    setFlaggedQuestions((prev) => ({ ...prev, [currentKey]: !prev[currentKey] }));
  };

  const switchQuestion = (newIdx: number) => {
    if (currentKey) {
      const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
      if (elapsed > 0) {
        setQuestionTimeMap((prev) => ({
          ...prev,
          [currentKey]: (prev[currentKey] || 0) + elapsed,
        }));
      }
    }
    questionStartTimeRef.current = Date.now();
    setCurrentQuestionIdx(newIdx);
  };

  // Handle module completion with adaptive difficulty routing
  const handleProceedFromReview = async () => {
    if (!exam || !currentModule) return;

    // Evaluate Module 1 performance for adaptive routing
    if (currentModule.moduleNumber === 1) {
      let m1Correct = 0;
      for (const q of currentModule.questions) {
        const key = `${currentModule.id}_${q.questionId}`;
        const userAns = (userAnswers[key] || '').trim().toUpperCase();
        if (userAns && userAns === q.correctAnswer.trim().toUpperCase()) {
          m1Correct++;
        }
      }

      const isRW = currentModule.section === 'reading-writing';
      if (isRW) {
        setM1RWRaw(m1Correct);
      } else {
        setM1MathRaw(m1Correct);
      }

      // Route Module 2 adaptively
      try {
        const excludeIds = currentModule.questions.map((q) => q.questionId);
        const res = await fetch('/api/sat/exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'route_module',
            section: currentModule.section,
            m1CorrectCount: m1Correct,
            m1Total: currentModule.questions.length,
            excludeIds,
          }),
        });

        const data = await res.json();
        if (data.success && data.module) {
          if (isRW) setIsRWHard(data.isHard);
          else setIsMathHard(data.isHard);

          // Update Module 2 in exam
          const nextModIdx = currentModuleIdx + 1;
          const updatedModules = [...exam.modules];
          updatedModules[nextModIdx] = data.module;
          setExam({ ...exam, modules: updatedModules });
        }
      } catch (err) {
        console.warn('Adaptive routing fallback', err);
      }
    }

    if (currentModuleIdx < exam.modules.length - 1) {
      const nextIdx = currentModuleIdx + 1;
      setCurrentModuleIdx(nextIdx);
      setCurrentQuestionIdx(0);
      setSecondsRemaining(exam.modules[nextIdx].timeMinutes * 60);
      setExamState('active');
    } else {
      // Complete exam and score
      await calculateAndFinish();
    }
  };

  const calculateAndFinish = async () => {
    if (!exam) return;
    localStorage.removeItem(STORAGE_KEY);

    let rwCorrect = 0;
    let totalRW = 0;
    let mathCorrect = 0;
    let totalMath = 0;

    for (const mod of exam.modules) {
      const isRW = mod.section === 'reading-writing';
      for (const q of mod.questions) {
        if (isRW) totalRW++;
        else totalMath++;

        const key = `${mod.id}_${q.questionId}`;
        const userAns = (userAnswers[key] || '').trim().toUpperCase();
        const correct = q.correctAnswer.trim().toUpperCase();

        if (userAns && userAns === correct) {
          if (isRW) rwCorrect++;
          else mathCorrect++;
        }
      }
    }

    // 1. Automatically save missed questions to Mistake Vault
    for (const mod of exam.modules) {
      for (const q of mod.questions) {
        const key = `${mod.id}_${q.questionId}`;
        const userAns = (userAnswers[key] || '').trim().toUpperCase();
        const correct = q.correctAnswer.trim().toUpperCase();
        if (userAns !== correct) {
          saveMistake({
            questionId: q.questionId,
            section: mod.section,
            domain: q.domain,
            skill: q.skill,
            difficulty: q.difficulty,
            prompt: q.prompt,
            choices: q.choices,
            correctAnswer: q.correctAnswer,
            userAnswer: userAns || '[Omitted]',
            rationale: q.rationale,
          });
        }
      }
    }

    // 2. Compute Pacing Diagnostics
    let rwTimeSum = 0;
    let rwCount = 0;
    let mathTimeSum = 0;
    let mathCount = 0;
    let rushed = 0;
    let optimal = 0;
    let overtime = 0;

    for (const mod of exam.modules) {
      const isRW = mod.section === 'reading-writing';
      for (const q of mod.questions) {
        const key = `${mod.id}_${q.questionId}`;
        const timeSpent = questionTimeMap[key] || (isRW ? 71 : 95);
        if (isRW) {
          rwTimeSum += timeSpent;
          rwCount++;
        } else {
          mathTimeSum += timeSpent;
          mathCount++;
        }

        if (timeSpent < 25) rushed++;
        else if (timeSpent > 120) overtime++;
        else optimal++;
      }
    }

    const avgRWSeconds = rwCount > 0 ? Math.round(rwTimeSum / rwCount) : 71;
    const avgMathSeconds = mathCount > 0 ? Math.round(mathTimeSum / mathCount) : 95;

    setPacingAnalysis({
      avgRWSeconds,
      avgMathSeconds,
      rushedCount: rushed,
      optimalCount: optimal,
      overtimeCount: overtime,
    });

    try {
      const res = await fetch('/api/sat/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rwCorrect,
          totalRW,
          mathCorrect,
          totalMath,
          isRWHard,
          isMathHard,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFinalScore({
          ...data.score,
          rwCorrect,
          mathCorrect,
          totalRW,
          totalMath,
        });

        // Save to persistent exam history
        saveCompletedExam({
          totalScore: data.score.totalScore,
          rwScore: data.score.rwScore,
          mathScore: data.score.mathScore,
          percentile: data.score.percentile,
          rwCorrect,
          totalRW,
          mathCorrect,
          totalMath,
          isRWHard,
          isMathHard,
          avgTimeRWSeconds: avgRWSeconds,
          avgTimeMathSeconds: avgMathSeconds,
        });
      }
    } catch (err) {
      console.error('Scoring error', err);
    }
    setExamState('score_report');
  };

  // Load past history on mount / state change
  useEffect(() => {
    setPastExamHistory(getExamHistory());
  }, [examState]);

  // Track time spent per question
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    return () => {
      if (exam && exam.modules[currentModuleIdx]) {
        const q = exam.modules[currentModuleIdx].questions[currentQuestionIdx];
        if (q) {
          const key = `${exam.modules[currentModuleIdx].id}_${q.questionId}`;
          const elapsed = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
          setQuestionTimeMap((prev) => ({
            ...prev,
            [key]: (prev[key] || 0) + elapsed,
          }));
        }
      }
    };
  }, [currentModuleIdx, currentQuestionIdx, exam]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', minHeight: '80vh', paddingBottom: '4rem' }}>
      {/* ==================================================== */}
      {/* 1. INTRO & RESUME SCREEN */}
      {/* ==================================================== */}
      {examState === 'intro' && (
        <div style={{ maxWidth: '720px', margin: '2rem auto' }}>
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
              marginBottom: '2rem',
            }}
          >
            <ChevronLeft size={14} /> Back to SAT Portal
          </Link>

          <span className="section-label">TEST SIMULATOR</span>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.6rem' }}>Digital SAT Exam</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Two-stage adaptive test matching the official format. Your performance on Module 1 determines whether you route to the higher or lower difficulty tier for Module 2.
          </p>

          {/* Resume Prompt Card if an exam is in progress */}
          {hasSavedExam && savedExamMeta && (
            <div
              className="panel"
              style={{
                padding: '1.75rem',
                marginBottom: '2rem',
                border: '1.5px solid var(--accent)',
                background: 'rgba(184, 74, 57, 0.03)',
              }}
            >
              <span className="section-label" style={{ color: 'var(--accent)', marginBottom: '0.3rem' }}>
                INCOMPLETE TEST IN PROGRESS
              </span>
              <h3 style={{ fontSize: '1.3rem', margin: '0.2rem 0 0.5rem' }}>
                Resume Your Exam Session
              </h3>
              <p style={{ color: 'var(--ink)', fontSize: '0.9rem', marginBottom: '1.25rem', opacity: 0.9 }}>
                You have an in-progress exam on <strong>{savedExamMeta.moduleName}</strong> (Question {savedExamMeta.questionNum}) with <strong>{savedExamMeta.timeRemaining}</strong> remaining.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResumeSavedExam}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.7rem 1.4rem',
                    background: 'var(--accent)',
                    color: '#fff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <Play size={15} /> Resume Test
                </button>

                <button
                  type="button"
                  onClick={handleStartFreshExam}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.7rem 1.25rem',
                    background: 'var(--panel-light, #fff)',
                    color: 'var(--ink)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={14} /> Start New Test
                </button>
              </div>
            </div>
          )}

          {/* Exam Structure Box */}
          <div className="panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Test Sections & Timing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
              <div>
                <strong>Reading & Writing</strong><br />
                <span style={{ color: 'var(--muted)' }}>Module 1: 27 Qs (32 mins)</span><br />
                <span style={{ color: 'var(--muted)' }}>Module 2: 27 Qs (32 mins, Adaptive)</span>
              </div>
              <div>
                <strong>Mathematics</strong><br />
                <span style={{ color: 'var(--muted)' }}>Module 1: 22 Qs (35 mins)</span><br />
                <span style={{ color: 'var(--muted)' }}>Module 2: 22 Qs (35 mins, Adaptive)</span>
              </div>
              <div>
                <strong>Score Scale</strong><br />
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Total: 400–1600</span><br />
                <span style={{ color: 'var(--muted)' }}>Sections: 200–800 each</span>
              </div>
            </div>
          </div>

          {/* Past History & Mistake Vault Link on Intro */}
          {pastExamHistory.length > 0 && (
            <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="section-label" style={{ margin: 0 }}>SAVED ATTEMPTS</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                  Latest: {pastExamHistory[0].totalScore} (RW {pastExamHistory[0].rwScore} / Math {pastExamHistory[0].mathScore})
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink)', opacity: 0.85, margin: '0 0 1rem 0' }}>
                You have completed <strong>{pastExamHistory.length}</strong> previous adaptive test(s) on this device. All results and missed questions remain saved in your browser.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  href="/sat/practice/drill?mode=mistakes"
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.9rem',
                    borderRadius: '4px',
                    background: 'var(--accent)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Drill Missed Questions <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {!hasSavedExam && (
            <button
              type="button"
              onClick={handleStartFreshExam}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: 'var(--ink)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{loading ? 'Preparing Questions...' : 'Start Adaptive Exam'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. ACTIVE TEST PLAYER */}
      {/* ==================================================== */}
      {examState === 'active' && currentModule && currentQuestion && (
        <div>
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="section-label" style={{ margin: 0 }}>
                {currentModule.title}
              </span>
            </div>

            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowTimer(!showTimer)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: secondsRemaining < 300 ? 'rgba(239, 68, 68, 0.1)' : '#fff',
                  border: '1px solid var(--border)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: secondsRemaining < 300 ? '#b91c1c' : 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <Clock size={15} />
                <span>{showTimer ? formatTime(secondsRemaining) : 'Timer Hidden'}</span>
              </button>
            </div>

            {/* Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {currentModule.section === 'math' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDesmosModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fff',
                      border: '1px solid var(--border)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    <Calculator size={14} /> Calculator
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDesmosKeyModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fff',
                      border: '1px solid var(--border)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Desmos Shortcuts
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setShowReferenceModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                <FileText size={14} /> Reference Guide
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Your progress is automatically saved. Return to home?')) {
                    setExamState('intro');
                    setHasSavedExam(true);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Pause & Exit
              </button>
            </div>
          </div>

          {/* Sub-Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(28,28,30,0.02)', padding: '0.75rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600 }}>
              Question {currentQuestionIdx + 1} of {currentModule.questions.length}
            </span>

            <button
              type="button"
              onClick={toggleFlag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: flaggedQuestions[currentKey] ? 'rgba(184, 74, 57, 0.1)' : 'transparent',
                border: '1px solid',
                borderColor: flaggedQuestions[currentKey] ? 'var(--accent)' : 'var(--border)',
                color: flaggedQuestions[currentKey] ? 'var(--accent)' : 'var(--muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              <Flag size={13} fill={flaggedQuestions[currentKey] ? 'currentColor' : 'none'} />
              <span>{flaggedQuestions[currentKey] ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Prompt with KaTeX math rendering */}
          <div className="panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <div
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.75',
                marginBottom: '2rem',
                color: 'var(--ink)',
                whiteSpace: 'pre-wrap',
              }}
            >
              <MathView content={currentQuestion.prompt} />
            </div>

            {/* Answer Options */}
            {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {currentQuestion.choices.map((choiceText, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = (userAnswers[currentKey] || '') === letter;

                  return (
                    <div
                      key={letter}
                      onClick={() => handleSelectAnswer(letter)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.9rem 1.25rem',
                        borderRadius: '6px',
                        border: isSelected ? '1px solid var(--ink)' : '1px solid var(--border)',
                        background: isSelected ? 'rgba(28,28,30,0.03)' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected ? '1px solid var(--ink)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--ink)' : '#fff',
                          color: isSelected ? '#fff' : 'var(--ink)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {letter}
                      </span>
                      <span style={{ fontSize: '0.96rem' }}>
                        <MathView content={choiceText || `[Choice ${letter}]`} />
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  STUDENT PRODUCED RESPONSE (GRID-IN):
                </label>
                <input
                  type="text"
                  placeholder="Enter response..."
                  value={userAnswers[currentKey] || ''}
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-mono)',
                    maxWidth: '300px',
                    width: '100%',
                  }}
                />
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => setShowNavGridModal(true)}
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              Question Grid ({Object.keys(userAnswers).filter((k) => k.startsWith(currentModule.id)).length}/{currentModule.questions.length})
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => switchQuestion(Math.max(0, currentQuestionIdx - 1))}
                disabled={currentQuestionIdx === 0}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentQuestionIdx === 0 ? 0.5 : 1,
                  fontSize: '0.85rem',
                }}
              >
                Back
              </button>

              {currentQuestionIdx < currentModule.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => switchQuestion(currentQuestionIdx + 1)}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--ink)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    switchQuestion(currentQuestionIdx);
                    setExamState('module_review');
                  }}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Review & Submit Module
                </button>
              )}
            </div>
          </div>

          {/* QUESTION NAV GRID MODAL */}
          {showNavGridModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
              onClick={() => setShowNavGridModal(false)}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '2rem',
                  maxWidth: '560px',
                  width: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Question Review Grid</h3>
                  <button
                    type="button"
                    onClick={() => setShowNavGridModal(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  {currentModule.questions.map((q, idx) => {
                    const key = `${currentModule.id}_${q.questionId}`;
                    const isAnswered = !!userAnswers[key];
                    const isFlagged = !!flaggedQuestions[key];
                    const isCurrent = idx === currentQuestionIdx;

                    return (
                      <button
                        key={q.questionId}
                        type="button"
                        onClick={() => {
                          switchQuestion(idx);
                          setShowNavGridModal(false);
                        }}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '4px',
                          border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: isAnswered ? 'rgba(28,28,30,0.06)' : '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: 'var(--accent)',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>● Answered</span>
                  <span>○ Unanswered</span>
                  <span style={{ color: 'var(--accent)' }}>● Red: Flagged</span>
                </div>
              </div>
            </div>
          )}

          {/* DESMOS MODAL */}
          {showDesmosModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1.5rem',
              }}
              onClick={() => setShowDesmosModal(false)}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  width: '90vw',
                  height: '80vh',
                  maxWidth: '1000px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Calculator size={16} /> Official Desmos Graphing Calculator
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDesmosModal(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <iframe
                  src="https://www.desmos.com/calculator"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Desmos Graphing Calculator"
                />
              </div>
            </div>
          )}

          {/* SAT REFERENCE GUIDE MODAL (Math Formulas + English Conventions) */}
          <SATReferenceGuideModal
            isOpen={showReferenceModal}
            onClose={() => setShowReferenceModal(false)}
            defaultTab={currentModule.section === 'math' ? 'math' : 'english'}
          />

          {/* DESMOS MASTER KEY MODAL */}
          <DesmosMasterKeyModal
            isOpen={showDesmosKeyModal}
            onClose={() => setShowDesmosKeyModal(false)}
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. MODULE REVIEW SCREEN */}
      {/* ==================================================== */}
      {examState === 'module_review' && currentModule && (
        <div style={{ maxWidth: '720px', margin: '2rem auto' }}>
          <span className="section-label">MODULE SUMMARY</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{currentModule.title} Review</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Check your flagged questions before submitting. Once submitted, you cannot return to this module.
          </p>

          <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {currentModule.questions.map((q, idx) => {
                const key = `${currentModule.id}_${q.questionId}`;
                const isAnswered = !!userAnswers[key];
                const isFlagged = !!flaggedQuestions[key];

                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIdx(idx);
                      setExamState('active');
                    }}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: isAnswered ? 'rgba(28,28,30,0.06)' : '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              <span>● Answered</span>
              <span>○ Unanswered</span>
              <span style={{ color: 'var(--accent)' }}>● Flagged</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setExamState('active')}
              style={{
                padding: '0.7rem 1.25rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Return to Module
            </button>

            <button
              type="button"
              onClick={handleProceedFromReview}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {currentModuleIdx < (exam?.modules.length || 0) - 1 ? 'Submit & Proceed to Next Module' : 'Submit & Calculate Score'}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. FINAL SCORE REPORT */}
      {/* ==================================================== */}
      {examState === 'score_report' && finalScore && (
        <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <span className="section-label">DIAGNOSTIC REPORT</span>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>Scaled SAT Results</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2.5rem' }}>
            Computed using official Digital SAT adaptive equating curves.
          </p>

          <div
            className="panel"
            style={{
              padding: '2.5rem',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              background: 'rgba(184, 74, 57, 0.03)',
              borderColor: 'rgba(184, 74, 57, 0.2)',
              marginBottom: '3rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span className="tech-label">TOTAL SCORE</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
                {finalScore.totalScore}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Scale: 400–1600 • ~{finalScore.percentile}th Percentile
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span className="tech-label">READING & WRITING</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 600, color: 'var(--accent)' }}>
                {finalScore.rwScore}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {finalScore.rwCorrect}/{finalScore.totalRW} Correct {isRWHard ? '(Hard Tier)' : '(Standard Tier)'}
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span className="tech-label">MATHEMATICS</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 600, color: 'var(--accent)' }}>
                {finalScore.mathScore}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {finalScore.mathCorrect}/{finalScore.totalMath} Correct {isMathHard ? '(Hard Tier)' : '(Standard Tier)'}
              </span>
            </div>
          </div>

          {/* MISTAKE VAULT SYNC CONFIRMATION */}
          <div
            className="panel"
            style={{
              padding: '1.25rem 1.75rem',
              marginBottom: '2rem',
              background: 'rgba(16, 185, 129, 0.04)',
              borderColor: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#065f46', marginBottom: '0.2rem' }}>
                ✓ Missed Questions Synced to Mistake Vault
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857' }}>
                All incorrect answers from this exam have been saved in your browser. You can re-test only your mistakes anytime.
              </div>
            </div>

            <Link
              href="/sat/practice/drill?mode=mistakes"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.55rem 1.1rem',
                background: '#059669',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              Open Mistake Vault <ArrowRight size={13} />
            </Link>
          </div>

          {/* PACING DIAGNOSTICS CARD */}
          {pacingAnalysis && (
            <div className="panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span className="section-label" style={{ margin: 0 }}>PACING & TIME EFFICIENCY</span>
                  <h3 style={{ fontSize: '1.25rem', margin: '0.2rem 0 0 0' }}>Seconds-Per-Question Diagnostics</h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  Target: RW ~71s • Math ~95s
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '1rem', borderRadius: '6px', background: 'rgba(28,28,30,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Reading & Writing Average
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                    {pacingAnalysis.avgRWSeconds}s <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--muted)' }}>/ question</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: pacingAnalysis.avgRWSeconds > 85 ? '#b91c1c' : '#059669' }}>
                    {pacingAnalysis.avgRWSeconds > 85 ? '⚠ Slower than 71s target pace' : '✓ Good pacing momentum'}
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '6px', background: 'rgba(28,28,30,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Mathematics Average
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                    {pacingAnalysis.avgMathSeconds}s <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--muted)' }}>/ question</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: pacingAnalysis.avgMathSeconds > 115 ? '#b91c1c' : '#059669' }}>
                    {pacingAnalysis.avgMathSeconds > 115 ? '⚠ Over 95s target pace' : '✓ Good pacing momentum'}
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '6px', background: 'rgba(28,28,30,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Pacing Distribution
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: '#059669', fontWeight: 700 }}>{pacingAnalysis.optimalCount}</span> Optimal
                    </div>
                    <div>
                      <span style={{ color: '#b45309', fontWeight: 700 }}>{pacingAnalysis.rushedCount}</span> Rushed
                    </div>
                    <div>
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>{pacingAnalysis.overtimeCount}</span> Time Sinks
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                    Rushed (&lt;25s) • Optimal (25-100s) • Time Sinks (&gt;120s)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAST EXAM HISTORY TABLE */}
          {pastExamHistory.length > 0 && (
            <div className="panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Persistent Score Trajectory</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  Saved in Browser ({pastExamHistory.length} attempts)
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted)' }}>
                      <th style={{ padding: '0.5rem 0' }}>Date & Time</th>
                      <th>Total Score</th>
                      <th>Reading & Writing</th>
                      <th>Math</th>
                      <th>Percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastExamHistory.slice(0, 5).map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '0.65rem 0', color: 'var(--ink)' }}>{h.date}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{h.totalScore}</td>
                        <td>{h.rwScore} ({h.rwCorrect}/{h.totalRW})</td>
                        <td>{h.mathScore} ({h.mathCorrect}/{h.totalMath})</td>
                        <td>~{h.percentile}th</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleStartFreshExam}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Take Another Adaptive Exam
            </button>

            <Link
              href="/sat/practice/drill?mode=mistakes"
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              Re-Test Missed Questions
            </Link>

            <Link
              href="/sat/practice/drill"
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--ink)',
                fontWeight: 600,
              }}
            >
              Targeted Domain Practice
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

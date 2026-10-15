'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Timer, 
  Flag, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Sparkles, 
  HelpCircle,
  RotateCcw,
  BarChart2,
  XCircle,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Brain,
  Zap
} from 'lucide-react';
import { 
  getAllPastProblems, 
  AMCContestProblem, 
  calculateAMC12Score, 
  calculateAIMEScore, 
  calculateUSAMOIndex,
  calculateGuessingEV,
  AMC12ScoreReport
} from '@/lib/amc-aime';
import MathView from '@/app/components/MathView';

type ContestMode = 'AMC12' | 'AIME';
type ErrorTag = 'concept_gap' | 'examiner_trap' | 'careless_calc' | 'time_pressure';

export default function AMCSimulatorPage() {
  const [contestMode, setContestMode] = useState<ContestMode>('AMC12');
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Time limit: 75 mins (4500s) for AMC 12, 180 mins (10800s) for AIME
  const [timeLeft, setTimeLeft] = useState<number>(4500);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Questions loaded
  const [questions, setQuestions] = useState<AMCContestProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // Student answers: questionId -> answer string
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  // Flagged questions: questionId -> boolean
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  // Strikethrough eliminated choices for AMC 12: questionId -> Set of choice indices
  const [eliminatedChoices, setEliminatedChoices] = useState<Record<string, number[]>>({});

  // Error tags on review: questionId -> ErrorTag
  const [errorTags, setErrorTags] = useState<Record<string, ErrorTag>>({});

  // Results
  const [scoreReport, setScoreReport] = useState<AMC12ScoreReport | null>(null);
  const [aimeScore, setAimeScore] = useState<number | null>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize questions on contestMode change
  useEffect(() => {
    const all = getAllPastProblems();
    if (contestMode === 'AMC12') {
      const amcPool = all.filter((p) => p.contest.startsWith('AMC12'));
      setQuestions(amcPool.length > 0 ? amcPool : all);
      setTimeLeft(75 * 60);
    } else {
      const aimePool = all.filter((p) => p.contest.startsWith('AIME'));
      setQuestions(aimePool.length > 0 ? aimePool : all);
      setTimeLeft(180 * 60);
    }
    setStudentAnswers({});
    setFlaggedQuestions({});
    setEliminatedChoices({});
    setCurrentIdx(0);
    setExamStarted(false);
    setExamSubmitted(false);
    setScoreReport(null);
    setAimeScore(null);
  }, [contestMode]);

  // Timer countdown
  useEffect(() => {
    if (examStarted && !examSubmitted && !isTimerPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examSubmitted, isTimerPaused, timeLeft]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setExamSubmitted(false);
  };

  const handleSelectChoice = (choiceLetter: string) => {
    const q = questions[currentIdx];
    if (!q) return;
    setStudentAnswers((prev) => ({ ...prev, [q.id]: choiceLetter }));
  };

  const handleLeaveBlank = () => {
    const q = questions[currentIdx];
    if (!q) return;
    setStudentAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
  };

  const toggleFlag = () => {
    const q = questions[currentIdx];
    if (!q) return;
    setFlaggedQuestions((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
  };

  const toggleEliminateChoice = (choiceIndex: number) => {
    const q = questions[currentIdx];
    if (!q) return;
    setEliminatedChoices((prev) => {
      const currentList = prev[q.id] || [];
      if (currentList.includes(choiceIndex)) {
        return { ...prev, [q.id]: currentList.filter((idx) => idx !== choiceIndex) };
      } else {
        return { ...prev, [q.id]: [...currentList, choiceIndex] };
      }
    });
  };

  const handleFinalSubmit = () => {
    setExamSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    if (contestMode === 'AMC12') {
      let correct = 0;
      let blanks = 0;
      let wrong = 0;

      questions.forEach((q) => {
        const studentAns = studentAnswers[q.id];
        if (!studentAns || studentAns.trim() === '') {
          blanks++;
        } else if (studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
          correct++;
        } else {
          wrong++;
        }
      });

      const report = calculateAMC12Score(correct, blanks, wrong);
      setScoreReport(report);
    } else {
      let correct = 0;
      questions.forEach((q) => {
        const studentAns = studentAnswers[q.id] || '';
        // Normalize 3-digit strings e.g. "80" -> "080"
        const normalizedStudent = studentAns.trim().padStart(3, '0');
        const normalizedCorrect = q.correctAnswer.trim().padStart(3, '0');
        if (normalizedStudent === normalizedCorrect) {
          correct++;
        }
      });
      setAimeScore(correct);
    }
  };

  const handleTagError = (questionId: string, tag: ErrorTag) => {
    setErrorTags((prev) => ({ ...prev, [questionId]: tag }));
    try {
      const existing = JSON.parse(localStorage.getItem('thinkib:amc-error-tags') || '{}');
      existing[questionId] = tag;
      localStorage.setItem('thinkib:amc-error-tags', JSON.stringify(existing));
    } catch (e) {
      // localStorage fallback
    }
  };

  const currentQ = questions[currentIdx];
  const currentEliminated = (currentQ && eliminatedChoices[currentQ.id]) || [];
  const guessingEV = calculateGuessingEV(currentEliminated.length);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #fbfbfa)', color: 'var(--ink, #1c1c1e)', paddingBottom: '5rem' }}>
      {/* Top Header */}
      <div 
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel, #ffffff)',
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              href="/amc-aime" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted, #666)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}
              className="hover:text-black"
            >
              <ArrowLeft size={16} /> Hub
            </Link>
            <div style={{ height: '16px', width: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Timer size={18} color="#eb5757" />
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {contestMode === 'AMC12' ? 'AMC 12 Contest Simulator' : 'AIME Contest Simulator'}
              </span>
            </div>
          </div>

          {/* Active Timer & Submit button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {examStarted && !examSubmitted && (
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: timeLeft < 300 ? '#eb5757' : 'inherit',
                  background: timeLeft < 300 ? 'rgba(235, 87, 87, 0.1)' : 'var(--border)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '8px'
                }}
              >
                <Timer size={16} /> {formatTimer(timeLeft)}
              </div>
            )}

            {examStarted && !examSubmitted ? (
              <button
                onClick={handleFinalSubmit}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: '#2ea043',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Submit Exam
              </button>
            ) : !examStarted ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setContestMode('AMC12')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: contestMode === 'AMC12' ? '1px solid #0969da' : '1px solid var(--border)',
                    background: contestMode === 'AMC12' ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                    color: contestMode === 'AMC12' ? '#0969da' : 'inherit',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  AMC 12 Mode
                </button>
                <button
                  onClick={() => setContestMode('AIME')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: contestMode === 'AIME' ? '1px solid #8250df' : '1px solid var(--border)',
                    background: contestMode === 'AIME' ? 'rgba(130, 80, 223, 0.1)' : 'transparent',
                    color: contestMode === 'AIME' ? '#8250df' : 'inherit',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  AIME Mode
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
        
        {/* Launcher Pre-Exam Screen */}
        {!examStarted ? (
          <div 
            style={{
              background: 'var(--panel, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '2.5rem',
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: contestMode === 'AMC12' ? 'rgba(9, 105, 218, 0.1)' : 'rgba(130, 80, 223, 0.1)', color: contestMode === 'AMC12' ? '#0969da' : '#8250df', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Timer size={28} />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              {contestMode === 'AMC12' ? 'Authentic AMC 12 Contest Simulation' : 'Authentic AIME Contest Simulation'}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted, #666)', lineHeight: 1.5, marginBottom: '2rem' }}>
              {contestMode === 'AMC12' 
                ? '75 minutes • 25 multiple-choice questions • +6 correct, +1.5 blank, 0 wrong • Live EV Game-Theory Elimination Assistant'
                : '180 minutes • 15 integer questions • Range 000–999 • No partial credit • Composite USA(J)MO Index Calculation'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg, #fbfbfa)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #888)' }}>Contest Format</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {contestMode === 'AMC12' ? '25 Questions (MCQ)' : '15 Questions (000–999)'}
                </div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg, #fbfbfa)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #888)' }}>Time Limit</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {contestMode === 'AMC12' ? '75 Minutes' : '180 Minutes'}
                </div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg, #fbfbfa)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #888)' }}>Target Benchmark</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {contestMode === 'AMC12' ? '~90 pts (AIME Cutoff)' : '7+ Correct (Honors)'}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              style={{
                padding: '0.85rem 2.5rem',
                borderRadius: '10px',
                background: '#0969da',
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(9, 105, 218, 0.25)'
              }}
            >
              Start Official Timer Now
            </button>
          </div>
        ) : examSubmitted ? (
          /* Post-Exam Score & Diagnostics Report */
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div 
              style={{
                background: 'var(--panel, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}
            >
              <Award size={48} color={scoreReport?.qualifiedForAIME || (aimeScore !== null && aimeScore >= 7) ? '#2ea043' : '#0969da'} style={{ margin: '0 auto 1rem' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {contestMode === 'AMC12' ? 'AMC 12 Score Report' : 'AIME Contest Score Report'}
              </h1>

              {contestMode === 'AMC12' && scoreReport && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', textTransform: 'uppercase' }}>Total Score</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0969da' }}>{scoreReport.totalScore} / 150</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', textTransform: 'uppercase' }}>Percentile</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2ea043' }}>{scoreReport.percentileEstimate}th</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', textTransform: 'uppercase' }}>AIME Status</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: scoreReport.qualifiedForAIME ? '#2ea043' : '#eb5757', marginTop: '0.65rem' }}>
                        {scoreReport.qualifiedForAIME ? 'QUALIFIED' : 'NOT QUALIFIED'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted, #666)' }}>
                    <span>Correct: <strong>{scoreReport.correctCount}</strong> (+{scoreReport.correctCount * 6} pts)</span>
                    <span>Blank: <strong>{scoreReport.blankCount}</strong> (+{scoreReport.blankCount * 1.5} pts)</span>
                    <span>Incorrect: <strong>{scoreReport.wrongCount}</strong> (0 pts)</span>
                  </div>

                  <p style={{ marginTop: '1.25rem', fontSize: '0.95rem', color: 'var(--ink)' }}>
                    <strong>Coaching Advice:</strong> {scoreReport.advice}
                  </p>
                </div>
              )}

              {contestMode === 'AIME' && aimeScore !== null && (
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8250df', margin: '1rem 0' }}>
                    {aimeScore} / 15
                  </div>
                  <p style={{ fontSize: '1rem', color: 'var(--text-muted, #666)' }}>
                    Composite USAMO Index with default 96 AMC 12: <strong>{96 + 10 * aimeScore}</strong> (Cutoff ~225)
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setExamStarted(false);
                  setExamSubmitted(false);
                }}
                style={{
                  marginTop: '1.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--border)',
                  color: 'inherit',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={15} /> Reset & Retake
              </button>
            </div>

            {/* Metacognitive Error Taxonomy Breakdown */}
            <div 
              style={{
                background: 'var(--panel, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '2rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Brain size={22} color="#0969da" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  Metacognitive Error Taxonomy & Mistake Analysis
                </h2>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Classify each incorrect question using the 4 root causes below. Identifying why you missed a question 
                is the single most effective way to cross the AIME and USAMO thresholds.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {questions.map((q, idx) => {
                  const studentAns = studentAnswers[q.id] || '';
                  const isCorrect = 
                    contestMode === 'AMC12'
                      ? studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()
                      : studentAns.trim().padStart(3, '0') === q.correctAnswer.trim().padStart(3, '0');
                  const isBlank = studentAns.trim() === '';
                  const activeTag = errorTags[q.id];

                  return (
                    <div 
                      key={q.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        background: isCorrect ? 'rgba(46, 160, 67, 0.03)' : isBlank ? 'var(--bg, #fbfbfa)' : 'rgba(235, 87, 87, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Q{idx + 1}. {q.id}</span>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: isCorrect ? 'rgba(46, 160, 67, 0.1)' : isBlank ? 'rgba(200, 200, 200, 0.2)' : 'rgba(235, 87, 87, 0.1)', color: isCorrect ? '#2ea043' : isBlank ? 'var(--text-muted, #666)' : '#eb5757', fontWeight: 600 }}>
                            {isCorrect ? 'Correct (+6)' : isBlank ? 'Left Blank (+1.5)' : 'Incorrect (0)'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                          Your: <strong>{studentAns || '(Blank)'}</strong> • Correct: <strong style={{ color: '#2ea043' }}>{q.correctAnswer}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                        <MathView content={q.statementLatex} />
                      </div>

                      {/* 1-Click Error Classification Pills */}
                      {!isCorrect && (
                        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #666)' }}>Root Cause:</span>
                          
                          <button
                            onClick={() => handleTagError(q.id, 'concept_gap')}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              border: activeTag === 'concept_gap' ? '1px solid #0969da' : '1px solid var(--border)',
                              background: activeTag === 'concept_gap' ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                              color: activeTag === 'concept_gap' ? '#0969da' : 'inherit',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            🧠 Concept Gap
                          </button>

                          <button
                            onClick={() => handleTagError(q.id, 'examiner_trap')}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              border: activeTag === 'examiner_trap' ? '1px solid #f59f00' : '1px solid var(--border)',
                              background: activeTag === 'examiner_trap' ? 'rgba(245, 159, 0, 0.1)' : 'transparent',
                              color: activeTag === 'examiner_trap' ? '#f59f00' : 'inherit',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            🪤 Examiner Trap
                          </button>

                          <button
                            onClick={() => handleTagError(q.id, 'careless_calc')}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              border: activeTag === 'careless_calc' ? '1px solid #eb5757' : '1px solid var(--border)',
                              background: activeTag === 'careless_calc' ? 'rgba(235, 87, 87, 0.1)' : 'transparent',
                              color: activeTag === 'careless_calc' ? '#eb5757' : 'inherit',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            🔢 Careless Execution
                          </button>

                          <button
                            onClick={() => handleTagError(q.id, 'time_pressure')}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              border: activeTag === 'time_pressure' ? '1px solid #8250df' : '1px solid var(--border)',
                              background: activeTag === 'time_pressure' ? 'rgba(130, 80, 223, 0.1)' : 'transparent',
                              color: activeTag === 'time_pressure' ? '#8250df' : 'inherit',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            ⏱️ Time Pressure
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Live Active Exam View */
          <div>
            {/* Question Quick Navigation Grid */}
            <div 
              style={{
                background: 'var(--panel, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                overflowX: 'auto'
              }}
            >
              {questions.map((q, qIndex) => {
                const isSelected = qIndex === currentIdx;
                const hasAnswer = studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== '';
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(qIndex)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: isSelected 
                        ? '2px solid #0969da' 
                        : isFlagged 
                          ? '1px solid #f59f00' 
                          : '1px solid var(--border)',
                      background: hasAnswer 
                        ? 'rgba(46, 160, 67, 0.15)' 
                        : isFlagged 
                          ? 'rgba(245, 159, 0, 0.1)' 
                          : 'transparent',
                      color: hasAnswer ? '#2ea043' : isFlagged ? '#f59f00' : 'inherit',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {qIndex + 1}
                  </button>
                );
              })}
            </div>

            {/* Active Question Workspace */}
            {currentQ && (
              <div 
                style={{
                  background: 'var(--panel, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header of question */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Question {currentIdx + 1}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>({currentQ.id})</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(9, 105, 218, 0.1)', color: '#0969da', fontWeight: 600 }}>
                      {currentQ.primaryTopic}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={toggleFlag}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: flaggedQuestions[currentQ.id] ? 'rgba(245, 159, 0, 0.15)' : 'transparent',
                        color: flaggedQuestions[currentQ.id] ? '#f59f00' : 'inherit',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Flag size={14} /> {flaggedQuestions[currentQ.id] ? 'Flagged' : 'Flag'}
                    </button>
                  </div>
                </div>

                {/* Problem Stem */}
                <div 
                  style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.65,
                    marginBottom: '2rem',
                    background: 'var(--bg, #fbfbfa)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <MathView content={currentQ.statementLatex} />
                </div>

                {/* AMC 12: Multiple Choice Selection + Live EV indicator */}
                {contestMode === 'AMC12' && currentQ.choices && currentQ.choices.length > 0 && (
                  <div>
                    {/* Live EV Guessing Bar */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: guessingEV.recommendGuess ? 'rgba(46, 160, 67, 0.08)' : 'rgba(235, 87, 87, 0.08)',
                        border: guessingEV.recommendGuess ? '1px solid rgba(46, 160, 67, 0.3)' : '1px solid rgba(235, 87, 87, 0.3)',
                        marginBottom: '1.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <Calculator size={16} color={guessingEV.recommendGuess ? '#2ea043' : '#eb5757'} />
                        <span style={{ fontWeight: 600 }}>Game-Theory EV:</span>
                        <span>{guessingEV.rationale}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #666)' }}>
                        Cross out eliminated choices using ✕
                      </span>
                    </div>

                    {/* Choices Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {currentQ.choices.map((choice, cIdx) => {
                        const letter = String.fromCharCode(65 + cIdx);
                        const isSelected = studentAnswers[currentQ.id] === letter;
                        const isEliminated = currentEliminated.includes(cIdx);

                        return (
                          <div 
                            key={cIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #0969da' : '1px solid var(--border)',
                              background: isSelected ? 'rgba(9, 105, 218, 0.06)' : 'var(--panel)',
                              opacity: isEliminated ? 0.4 : 1,
                              transition: 'all 0.15s'
                            }}
                          >
                            <div 
                              onClick={() => {
                                if (!isEliminated) handleSelectChoice(letter);
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isEliminated ? 'not-allowed' : 'pointer', flexGrow: 1 }}
                            >
                              <span style={{ width: '28px', height: '28px', borderRadius: '50%', border: isSelected ? '2px solid #0969da' : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#0969da' : 'inherit' }}>
                                {letter}
                              </span>
                              <span style={{ textDecoration: isEliminated ? 'line-through' : 'none', fontSize: '0.95rem' }}>
                                <MathView content={choice} />
                              </span>
                            </div>

                            <button
                              onClick={() => toggleEliminateChoice(cIdx)}
                              title={isEliminated ? 'Restore Choice' : 'Eliminate Choice (Strikethrough)'}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: isEliminated ? '#eb5757' : 'var(--text-muted, #888)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px'
                              }}
                            >
                              {isEliminated ? 'Undo' : '✕'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explicit Leave Blank Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <button
                        onClick={handleLeaveBlank}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: studentAnswers[currentQ.id] === undefined ? 'rgba(9, 105, 218, 0.08)' : 'transparent',
                          color: studentAnswers[currentQ.id] === undefined ? '#0969da' : 'var(--text-muted, #666)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Leave Blank (Secure +1.5 pts)
                      </button>
                    </div>
                  </div>
                )}

                {/* AIME: 3-Digit Integer Input */}
                {contestMode === 'AIME' && (
                  <div style={{ maxWidth: '320px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Enter 3-Digit Integer (000–999):
                    </label>
                    <input 
                      type="text" 
                      maxLength={3}
                      placeholder="e.g. 042"
                      value={studentAnswers[currentQ.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setStudentAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textAlign: 'center',
                        borderRadius: '10px',
                        border: '2px solid var(--border)',
                        background: 'var(--panel)',
                        color: 'inherit'
                      }}
                    />
                  </div>
                )}

                {/* Bottom Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentIdx === 0 ? 0.4 : 1,
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>
                    Question {currentIdx + 1} of {questions.length}
                  </span>

                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: currentIdx === questions.length - 1 ? 0.4 : 1,
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

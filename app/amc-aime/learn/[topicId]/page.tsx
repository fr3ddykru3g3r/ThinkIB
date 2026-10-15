'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Lightbulb, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  GitMerge,
  HelpCircle,
  Zap
} from 'lucide-react';
import { getDomainById, getAllDomains, getAllPastProblems, AMCContestProblem, AMCSubtopic } from '@/lib/amc-aime';
import MathView from '@/app/components/MathView';

export default function AnatomyDeconstructorPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const domain = getDomainById(topicId) || getDomainById('polynomials')!;
  const allDomains = getAllDomains();

  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>(
    domain.subtopics[0]?.id || ''
  );

  const subtopic = domain.subtopics.find((s) => s.id === selectedSubtopicId) || domain.subtopics[0];

  // Progressive steps reveal state for Stage 3
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>({});
  // Clue highlight state for Stage 1
  const [activeClueIndex, setActiveClueIndex] = useState<number | null>(null);
  // Show alternative solution state
  const [showAltSolution, setShowAltSolution] = useState<boolean>(false);

  // Fetch problems associated with this domain
  const relatedProblems = getAllPastProblems({
    topic: domain.title,
  });

  const [activeProblemIndex, setActiveProblemIndex] = useState<number>(0);
  const currentProblem = relatedProblems[activeProblemIndex] || null;

  const toggleStep = (idx: number) => {
    setRevealedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #fbfbfa)', color: 'var(--ink, #1c1c1e)', paddingBottom: '5rem' }}>
      {/* Top Header Bar */}
      <div 
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel, #ffffff)',
          padding: '1.25rem 1.5rem',
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
              <ArrowLeft size={16} /> Back to Hub
            </Link>
            <div style={{ height: '16px', width: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0969da', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deconstructor
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {domain.title}
            </span>
          </div>

          {/* Domain Dropdown / Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>Domain:</span>
            <select
              value={domain.id}
              onChange={(e) => router.push(`/amc-aime/learn/${e.target.value}`)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'inherit',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {allDomains.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
        
        {/* Subtopics Pill Ribbon */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          {domain.subtopics.map((sub) => {
            const isSelected = sub.id === subtopic.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubtopicId(sub.id);
                  setRevealedSteps({});
                  setActiveClueIndex(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid #0969da' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(9, 105, 218, 0.08)' : 'var(--panel)',
                  color: isSelected ? '#0969da' : 'var(--text-muted, #666)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {sub.title}
              </button>
            );
          })}
        </div>

        {/* Subtopic Theoretical Foundation Card */}
        <div 
          style={{
            background: 'var(--panel, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#0969da" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{subtopic.title}</h2>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8250df', background: 'rgba(130, 80, 223, 0.08)', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
              {subtopic.aopsVolRef}
            </span>
          </div>

          <div style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            <MathView content={subtopic.conceptTheory} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#f59f00', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Zap size={15} /> Competition Trigger Signals (When to reach for this):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
              {subtopic.triggerSignals.map((sig, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', background: 'rgba(245, 159, 0, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                  <span style={{ color: '#f59f00', fontWeight: 700 }}>•</span>
                  <span><MathView content={sig} /></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4-Stage Anatomy of a Problem Deconstructor */}
        {subtopic.realProblemDeconstruction ? (
          <div 
            style={{
              background: 'var(--panel, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2ea043' }}>
                  4-Stage Problem Breakdown
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                  {subtopic.realProblemDeconstruction.problemId} (Problem #{subtopic.realProblemDeconstruction.problemNumber})
                </h3>
              </div>
              <span style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem', borderRadius: '8px', background: 'rgba(46, 160, 67, 0.1)', color: '#2ea043', fontWeight: 600 }}>
                Official Contest Problem
              </span>
            </div>

            {/* Problem Stem Box */}
            <div 
              style={{
                background: 'var(--bg, #fbfbfa)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                fontSize: '1.05rem',
                lineHeight: 1.6,
                marginBottom: '2rem'
              }}
            >
              <MathView content={subtopic.realProblemDeconstruction.stemLatex} />
            </div>

            {/* Stages Grid (1 to 4) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {subtopic.realProblemDeconstruction.stages.map((stg) => {
                const stageColors = [
                  { bg: 'rgba(9, 105, 218, 0.1)', text: '#0969da' },
                  { bg: 'rgba(245, 159, 0, 0.1)', text: '#f59f00' },
                  { bg: 'rgba(46, 160, 67, 0.1)', text: '#2ea043' },
                  { bg: 'rgba(130, 80, 223, 0.1)', text: '#8250df' },
                ];
                const color = stageColors[(stg.stage - 1) % stageColors.length];

                return (
                  <div 
                    key={stg.stage}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      background: 'var(--panel)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span 
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: color.bg,
                          color: color.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}
                      >
                        {stg.stage}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stg.title}</h4>
                    </div>

                    <div style={{ fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.55 }}>
                      <MathView content={stg.guidance} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Additional Authentic Problems in This Domain */}
        {relatedProblems.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                Authentic Contest Problems in {domain.title}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>
                {relatedProblems.length} available
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {relatedProblems.map((prob) => (
                <div 
                  key={prob.id}
                  style={{
                    background: 'var(--panel, #ffffff)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{prob.id}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(9, 105, 218, 0.1)', color: '#0969da', fontWeight: 600 }}>
                        Rating: {prob.difficultyRating}/7.0
                      </span>
                      {prob.isCrossTopicSynthesis && (
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(130, 80, 223, 0.1)', color: '#8250df', fontWeight: 600 }}>
                          Cross-Topic Synthesis
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>
                      Contest: {prob.contest} • #{prob.problemNumber}
                    </span>
                  </div>

                  <div style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.25rem', background: 'var(--bg, #fbfbfa)', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                    <MathView content={prob.statementLatex} />
                  </div>

                  {prob.choices && prob.choices.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {prob.choices.map((choice, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <div key={idx} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <strong>({letter})</strong> <MathView content={choice} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Socratic Step-by-Step Progressive Hint Reveal */}
                  {prob.progressiveSteps && prob.progressiveSteps.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0969da', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Lightbulb size={16} /> Progressive Socratic Solution Steps:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {prob.progressiveSteps.map((step, sIdx) => {
                          const isRevealed = revealedSteps[sIdx];
                          return (
                            <div key={sIdx} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                  {step.stepTitle}
                                </div>
                                <button
                                  onClick={() => toggleStep(sIdx)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    background: isRevealed ? 'var(--border)' : 'rgba(9, 105, 218, 0.1)',
                                    color: isRevealed ? 'var(--text-muted)' : '#0969da',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isRevealed ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Reveal Hint & Work</>}
                                </button>
                              </div>

                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)', marginTop: '0.35rem' }}>
                                <em>Prompt:</em> {step.hintQuestion}
                              </div>

                              {isRevealed && (
                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)', fontSize: '0.9rem', color: 'var(--ink)' }}>
                                  <MathView content={step.workLatex} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Common Pitfalls / Traps */}
                  {prob.commonTraps && prob.commonTraps.length > 0 && (
                    <div style={{ marginTop: '1rem', background: 'rgba(235, 87, 87, 0.05)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid #eb5757' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eb5757', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertTriangle size={14} /> Common Examiner Traps:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--ink)' }}>
                        {prob.commonTraps.map((trap, tIdx) => (
                          <li key={tIdx}>{trap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}

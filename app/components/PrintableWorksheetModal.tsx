'use client';

import React, { useState } from 'react';
import { X, Printer, CheckCircle, FileText } from 'lucide-react';
import { SATQuestion } from '@/lib/sat';
import MathView from './MathView';
import { getDesmosShortcutForQuestion } from '@/lib/desmos-shortcuts';

interface PrintableWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: SATQuestion[];
  title: string;
  subtitle?: string;
}

export default function PrintableWorksheetModal({
  isOpen,
  onClose,
  questions,
  title,
  subtitle,
}: PrintableWorksheetModalProps) {
  const [includeRationales, setIncludeRationales] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Floating Control Bar (Hidden during print) */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: '1rem',
          zIndex: 2100,
          background: '#1c1c1e',
          color: '#fff',
          borderRadius: '30px',
          padding: '0.6rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
          <FileText size={16} />
          <span>Printable Worksheet ({questions.length} Qs)</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeRationales}
            onChange={(e) => setIncludeRationales(e.target.checked)}
          />
          <span>Include Answer Key & Rationales</span>
        </label>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '0.45rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Printer size={14} /> Print / Save to PDF
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 / Letter styling) */}
      <div
        id="printable-worksheet"
        style={{
          background: '#ffffff',
          color: '#111827',
          width: '100%',
          maxWidth: '850px',
          padding: '3rem 3.5rem',
          borderRadius: '8px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Worksheet Header */}
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280' }}>
                THE ACADEMIC ARCHIVE • OFFICIAL SAT PRACTICE WORKSHEET
              </div>
              <h1 style={{ fontSize: '1.8rem', margin: '0.3rem 0 0.2rem', fontFamily: 'var(--font-display)', color: '#111827' }}>
                {title}
              </h1>
              {subtitle && <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b5563' }}>{subtitle}</p>}
            </div>

            {/* Score & Student Details Box */}
            <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.75rem 1rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', minWidth: '220px' }}>
              <div style={{ marginBottom: '0.4rem' }}>Student: ___________________</div>
              <div style={{ marginBottom: '0.4rem' }}>Date: ______________________</div>
              <div>Score: ______ / {questions.length}</div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {questions.map((q, idx) => {
            const isMultipleChoice = q.choices && q.choices.length > 0;
            return (
              <div
                key={q.questionId || idx}
                style={{
                  pageBreakInside: 'avoid',
                  borderBottom: '1px dashed #e5e7eb',
                  paddingBottom: '2rem',
                }}
              >
                {/* Question Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#6b7280' }}>
                  <span>
                    <strong>QUESTION {idx + 1}</strong> • {q.domain || 'General Domain'}
                  </span>
                  <span>{q.difficulty?.toUpperCase()} • {q.skill || 'Standard Skill'}</span>
                </div>

                {/* Prompt */}
                <div style={{ fontSize: '1rem', lineHeight: '1.65', color: '#111827', marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
                  <MathView content={q.prompt} />
                </div>

                {/* Choices */}
                {isMultipleChoice ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {q.choices!.map((c: any) => {
                      const letter = typeof c === 'string' ? c.charAt(0) : (c?.letter || '');
                      const text = typeof c === 'string' ? c.slice(3) : (c?.text || '');
                      return (
                        <div
                          key={letter}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '0.92rem',
                            lineHeight: '1.45',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '1.5px solid #374151',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            {letter}
                          </span>
                          <span>
                            <MathView content={text || ''} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Your Answer (Grid-in):</span>
                    <div style={{ width: '140px', height: '32px', border: '1.5px solid #374151', borderRadius: '4px' }} />
                  </div>
                )}

                {/* Scratch / Working Space Box */}
                <div
                  style={{
                    height: '80px',
                    border: '1px solid #f3f4f6',
                    background: 'repeating-linear-gradient(transparent, transparent 19px, #f3f4f6 20px)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontSize: '0.7rem',
                    color: '#9ca3af',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Scratchwork Space
                </div>
              </div>
            );
          })}
        </div>

        {/* Answer Key & Rationale Section (Optional) */}
        {includeRationales && (
          <div style={{ pageBreakBefore: 'always', marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #111827' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280' }}>
                THE ACADEMIC ARCHIVE • DETAILED SOLUTIONS
              </span>
              <h2 style={{ fontSize: '1.6rem', margin: '0.3rem 0', fontFamily: 'var(--font-display)' }}>
                Official Answer Key & Worked Rationales
              </h2>
            </div>

            {/* Quick Answer Key Grid */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '1rem 1.5rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Answer Key
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                {questions.map((q, idx) => (
                  <div key={idx} style={{ padding: '4px 6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '3px', textAlign: 'center' }}>
                    <span style={{ color: '#6b7280' }}>{idx + 1}: </span>
                    <strong style={{ color: '#b84a39' }}>{q.correctAnswer}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Worked Rationales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {questions.map((q, idx) => {
                const desmos = getDesmosShortcutForQuestion(q);
                return (
                  <div
                    key={idx}
                    style={{
                      pageBreakInside: 'avoid',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Question {idx + 1} — Correct Answer: <span style={{ color: '#b84a39' }}>{q.correctAnswer}</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#374151', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                      <MathView content={q.rationale || 'Refer to standard curriculum principles.'} />
                    </div>

                    {desmos && (
                      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px', padding: '0.65rem 0.85rem', fontSize: '0.82rem', color: '#0369a1' }}>
                        <strong>{desmos.title}:</strong> {desmos.proTip}
                        <div style={{ fontFamily: 'var(--font-mono)', marginTop: '4px', color: '#0284c7' }}>
                          Syntax: {desmos.desmosCode}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

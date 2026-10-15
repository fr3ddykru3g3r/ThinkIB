'use client';

import React from 'react';
import type { SATQuestion } from '@/lib/sat-types';
import { isSPR, validateSPR } from '@/lib/sat-grading';
import { QuestionStem, ChoiceContent, splitPassage } from './SATContent';

interface Props {
  q: SATQuestion;
  answer: string;
  onAnswer: (a: string) => void;
  /** After checking: colour correct / wrong choices and lock input. */
  reveal?: boolean;
  struck: Record<string, boolean>;
  onStrike: (letter: string) => void;
  /** Bluebook-style passage | question columns for Reading & Writing. */
  split?: boolean;
}

export default function QuestionBody({ q, answer, onAnswer, reveal, struck, onStrike, split = true }: Props) {
  const spr = isSPR(q);
  const parts = split && q.section === 'reading-writing' ? splitPassage(q) : null;
  const useSplit = !!parts && parts.passage.length > 0;

  const answerArea = spr ? (
    <div>
      <label htmlFor="spr" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
        STUDENT-PRODUCED RESPONSE
      </label>
      <input
        id="spr"
        className="sat-spr-input"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="e.g. 12, 3.5, 7/2"
        value={answer}
        disabled={reveal}
        onChange={(e) => onAnswer(e.target.value)}
        aria-describedby="spr-help"
      />
      <div id="spr-help" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
        {answer && !validateSPR(answer).ok ? (
          <span style={{ color: '#b45309' }}>{(validateSPR(answer) as { reason: string }).reason}</span>
        ) : (
          <>Up to 5 characters (6 if negative). Fractions and decimals both work; no mixed numbers or symbols.</>
        )}
      </div>
    </div>
  ) : (
    <div role="radiogroup" aria-label="Answer choices" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      {q.choices.map((_, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const selected = answer === letter;
        const isCorrect = q.correctAnswer === letter;
        const state = reveal ? (isCorrect ? 'correct' : selected ? 'wrong' : undefined) : undefined;
        return (
          <div key={letter} style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              className="sat-choice"
              data-selected={selected}
              data-state={state}
              data-struck={!!struck[letter] && !reveal}
              disabled={reveal}
              onClick={() => onAnswer(letter)}
            >
              <span className="sat-choice__letter">{letter}</span>
              <span className="sat-choice-body">
                <ChoiceContent q={q} index={idx} />
              </span>
            </button>
            {!reveal && (
              <button
                type="button"
                className="sat-choice__strike"
                onClick={() => onStrike(letter)}
                aria-label={struck[letter] ? `Restore choice ${letter}` : `Cross out choice ${letter}`}
                title="Cross out this choice"
              >
                {struck[letter] ? 'undo' : '✕'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  if (useSplit) {
    return (
      <div className="sat-split sat-split--rw">
        <div className="sat-split__passage">
          <QuestionStem q={q} only="passage" />
        </div>
        <div className="sat-split__question">
          <QuestionStem q={q} only="question" />
          {answerArea}
        </div>
      </div>
    );
  }
  return (
    <div>
      <QuestionStem q={q} />
      <div style={{ marginTop: '1rem' }}>{answerArea}</div>
    </div>
  );
}

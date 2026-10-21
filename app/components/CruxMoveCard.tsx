'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, BookmarkPlus } from 'lucide-react';
import { enqueueItem, getSRSQueue, SRSSource } from '@/lib/srs-engine';
import MathView from './MathView';

interface CruxMoveCardProps {
  id: string;
  source: SRSSource;
  title: string;
  cruxText: string;
  triggerClue?: string;
  synthesisBridge?: string;
  contextPrompt?: string;
}

export default function CruxMoveCard({
  id,
  source,
  title,
  cruxText,
  triggerClue,
  synthesisBridge,
  contextPrompt,
}: CruxMoveCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const queue = getSRSQueue();
      if (queue.some((item) => item.id === id)) {
        setIsSaved(true);
      }
    } catch {
      // ignore
    }
  }, [id]);

  const handleSave = () => {
    try {
      enqueueItem({
        id,
        source,
        refId: id,
        title,
        prompt: contextPrompt || title,
        answer: `Crux Move: ${cruxText}`,
        explanation: [triggerClue ? `Trigger Signal: ${triggerClue}` : '', synthesisBridge ? `Synthesis Bridge: ${synthesisBridge}` : ''].filter(Boolean).join('\n\n'),
        errorTag: 'concept_gap',
      });
      setIsSaved(true);
    } catch (err) {
      console.warn('Failed to enqueue crux move', err);
    }
  };

  return (
    <div
      style={{
        margin: '1.25rem 0',
        padding: '1.1rem 1.35rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(147, 51, 234, 0.04) 100%)',
        border: '1.5px solid rgba(217, 119, 6, 0.3)',
        boxShadow: '0 2px 10px rgba(217, 119, 6, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: '#d97706' }} />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#d97706',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            CRUX MOVE · PIVOTAL LEAP
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaved}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '6px',
            border: isSaved ? '1px solid rgba(22, 163, 74, 0.4)' : '1px solid rgba(217, 119, 6, 0.4)',
            background: isSaved ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.12)',
            color: isSaved ? '#15803d' : '#b45309',
            cursor: isSaved ? 'default' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isSaved ? (
            <>
              <Check size={13} />
              <span>Saved to Flashcards (FSRS)</span>
            </>
          ) : (
            <>
              <BookmarkPlus size={13} />
              <span>Save Crux to Flashcards</span>
            </>
          )}
        </button>
      </div>

      <div
        style={{
          fontSize: '0.94rem',
          lineHeight: 1.6,
          color: 'var(--ink, #1c1c1e)',
          fontWeight: 500,
        }}
      >
        <MathView content={cruxText} />
      </div>

      {(triggerClue || synthesisBridge) && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.65rem',
            borderTop: '1px dashed rgba(217, 119, 6, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '0.82rem',
            color: 'var(--muted, #64748b)',
          }}
        >
          {triggerClue && (
            <div>
              <strong style={{ color: '#d97706' }}>Trigger Signal:</strong> {triggerClue}
            </div>
          )}
          {synthesisBridge && (
            <div>
              <strong style={{ color: '#9333ea' }}>Synthesis Bridge:</strong> {synthesisBridge}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ExternalLink, Move } from 'lucide-react';
import type { DesmosExpressionPayload } from '@/lib/desmos-shortcuts';

// Desmos publishes this key for public, non-commercial embeds of its API.
const API_SRC = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        el: HTMLElement,
        opts?: Record<string, unknown>
      ) => {
        destroy: () => void;
        getState: () => any;
        setState: (state: any) => void;
        setBlank: () => void;
        setExpression: (expr: any) => void;
        setExpressions: (exprs: any[]) => void;
      };
    };
  }
}

/** Global dispatcher to send mathematical setups directly into the active Desmos calculator */
export function dispatchDesmosLoad(expressions: DesmosExpressionPayload[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('thinkib:desmos-load', { detail: { expressions } }));
  }
}

interface DesmosPanelProps {
  onClose: () => void;
  questionId?: string;
}

/**
 * Floating, draggable Desmos graphing calculator with per-question state persistence
 * and dynamic expression injection.
 */
export default function DesmosPanel({ onClose, questionId }: DesmosPanelProps) {
  const host = useRef<HTMLDivElement>(null);
  const calcRef = useRef<any>(null);
  const questionStatesRef = useRef<Record<string, any>>({});
  const prevQuestionIdRef = useRef<string | undefined>(questionId);

  const [error, setError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Calculator
  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || !host.current || !window.Desmos) return;
      if (calcRef.current) return;

      const calc = window.Desmos.GraphingCalculator(host.current, {
        keypad: true,
        expressions: true,
        settingsMenu: false,
        zoomButtons: true,
      });
      calcRef.current = calc;

      // Restore existing state if available for this questionId
      if (questionId && questionStatesRef.current[questionId]) {
        try {
          calc.setState(questionStatesRef.current[questionId]);
        } catch {
          calc.setBlank();
        }
      }
    };

    if (window.Desmos) {
      init();
    } else {
      const existing = document.querySelector(`script[src="${API_SRC}"]`);
      if (!existing) {
        const s = document.createElement('script');
        s.src = API_SRC;
        s.async = true;
        s.onload = init;
        s.onerror = () => setError(true);
        document.head.appendChild(s);
      } else {
        existing.addEventListener('load', init);
      }
    }

    return () => {
      cancelled = true;
      if (calcRef.current) {
        // Save current question before destroying
        if (questionId) {
          try {
            questionStatesRef.current[questionId] = calcRef.current.getState();
          } catch {}
        }
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
  }, []);

  // Handle questionId changes: persist previous question's state and restore or blank for new question
  useEffect(() => {
    const prevQ = prevQuestionIdRef.current;
    if (calcRef.current && prevQ && prevQ !== questionId) {
      try {
        questionStatesRef.current[prevQ] = calcRef.current.getState();
      } catch (e) {
        console.warn('[Desmos] Failed to snapshot calculator state:', e);
      }
    }

    if (calcRef.current && questionId && questionId !== prevQ) {
      const saved = questionStatesRef.current[questionId];
      if (saved) {
        try {
          calcRef.current.setState(saved);
        } catch {
          calcRef.current.setBlank();
        }
      } else {
        calcRef.current.setBlank();
      }
    }

    prevQuestionIdRef.current = questionId;
  }, [questionId]);

  // Listen for dynamic expressions load from shortcut tips
  useEffect(() => {
    const handleLoad = (e: Event) => {
      const customEvent = e as CustomEvent<{ expressions: DesmosExpressionPayload[] }>;
      if (!customEvent.detail?.expressions || !calcRef.current) return;

      const { expressions } = customEvent.detail;
      expressions.forEach((expr) => {
        try {
          if (expr.type === 'table' && expr.columns) {
            calcRef.current.setExpression({
              id: expr.id,
              type: 'table',
              columns: expr.columns,
            });
          } else {
            calcRef.current.setExpression({
              id: expr.id,
              latex: expr.latex,
              sliderBounds: expr.sliderBounds,
            });
          }
        } catch (err) {
          console.warn('[Desmos] Failed to load expression payload:', err);
        }
      });
    };

    window.addEventListener('thinkib:desmos-load', handleLoad);
    return () => window.removeEventListener('thinkib:desmos-load', handleLoad);
  }, []);

  // Dragging logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag from header, not buttons
    if ((e.target as HTMLElement).closest('button')) return;

    const panelEl = (e.currentTarget as HTMLElement).closest('[role="dialog"]') as HTMLElement;
    if (!panelEl) return;

    const rect = panelEl.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 200;

      const nextX = Math.max(16, Math.min(maxX, e.clientX - dragOffsetRef.current.x));
      const nextY = Math.max(16, Math.min(maxY, e.clientY - dragOffsetRef.current.y));

      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const stylePosition: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: 'min(480px, calc(100vw - 32px))',
        height: 'min(580px, calc(100vh - 80px))',
        zIndex: 900,
      }
    : {
        position: 'fixed',
        right: 16,
        bottom: 16,
        top: 90,
        width: 'min(480px, calc(100vw - 32px))',
        zIndex: 900,
      };

  return (
    <>
      {/* Invisible overlay while dragging to capture mousemove and prevent iframe sticking */}
      {isDragging && (
        <div
          className="fixed inset-0 z-[9998] cursor-grabbing select-none"
          style={{ background: 'transparent' }}
        />
      )}

      <div
        role="dialog"
        aria-label="Desmos graphing calculator"
        style={{
          ...stylePosition,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        }}
      >
        {/* Header - Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 0.9rem',
            borderBottom: '1px solid var(--border)',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: 'var(--surface-hover, rgba(0,0,0,0.02))',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Move size={14} style={{ color: 'var(--muted)', opacity: 0.7 }} />
            <span>Desmos Graphing Calculator</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {error ? (
          <div style={{ padding: '1.5rem', fontSize: '0.9rem' }}>
            Couldn't load the calculator (offline?).{' '}
            <a
              href="https://www.desmos.com/calculator"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              Open Desmos in a new tab <ExternalLink size={12} style={{ display: 'inline' }} />
            </a>
          </div>
        ) : (
          <div
            ref={host}
            style={{
              flex: 1,
              minHeight: 0,
              background: '#fff',
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
          />
        )}
      </div>
    </>
  );
}

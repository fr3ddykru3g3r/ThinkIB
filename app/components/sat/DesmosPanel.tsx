'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

// Desmos publishes this key for public, non-commercial embeds of its API.
const API_SRC = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

declare global {
  interface Window {
    Desmos?: { GraphingCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => { destroy: () => void } };
  }
}

/** Floating Desmos graphing calculator, the same tool Bluebook provides. Stays open beside the question. */
export default function DesmosPanel({ onClose }: { onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let calc: { destroy: () => void } | null = null;
    let cancelled = false;
    const init = () => {
      if (cancelled || !host.current || !window.Desmos) return;
      calc = window.Desmos.GraphingCalculator(host.current, { keypad: true, expressions: true, settingsMenu: false });
    };
    if (window.Desmos) init();
    else {
      const s = document.createElement('script');
      s.src = API_SRC;
      s.async = true;
      s.onload = init;
      s.onerror = () => setError(true);
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
      calc?.destroy();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-label="Desmos graphing calculator"
      style={{
        position: 'fixed', right: 16, bottom: 16, top: 90, width: 'min(460px, calc(100vw - 32px))', zIndex: 900,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem' }}>
        <span>Calculator</span>
        <button type="button" onClick={onClose} aria-label="Close calculator" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
          <X size={16} />
        </button>
      </div>
      {error ? (
        <div style={{ padding: '1.5rem', fontSize: '0.9rem' }}>
          Couldn't load the calculator (offline?).{' '}
          <a href="https://www.desmos.com/calculator" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            Open Desmos in a new tab <ExternalLink size={12} style={{ display: 'inline' }} />
          </a>
        </div>
      ) : (
        <div ref={host} style={{ flex: 1, minHeight: 0, background: '#fff' }} />
      )}
    </div>
  );
}

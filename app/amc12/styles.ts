import type React from 'react';

export const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
};

export const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '0.2rem 0.6rem',
  borderRadius: 999,
  fontSize: '0.72rem',
  fontFamily: 'var(--font-mono)',
  border: '1px solid var(--border)',
  color: 'var(--muted)',
  background: 'var(--surface-inset)',
};

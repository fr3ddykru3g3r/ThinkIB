'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  /** Treat `$15`-style amounts as money, not math. Turn off for content that
   *  escapes real dollars as `\$`, so math like `$2 + x$` renders. */
  currency?: boolean;
  block?: boolean;
  /** Escape <, > and & in the plain text around the math (for untrusted/plain content). */
  escapeHtml?: boolean;
}

export default function MathView({ content, className = '', style, currency = true, block = false, escapeHtml = false }: MathViewProps) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Regex to match:
    // 1. Display math: $$...$$
    // 2. Inline math: $...$ (making sure it's not empty, not escaped, and doesn't match single dollar currency like $50)
    // 3. \(...\) inline math or \[...\] display math
    
    // First, protect literal escaped dollars \$
    const ESCAPED_DOLLAR = '___ESCAPED_DOLLAR___';
    const CURRENCY_TOKEN = '___CURRENCY_DOLLAR___';
    let text = content.replace(/\\\$/g, ESCAPED_DOLLAR);
    if (escapeHtml) text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tex = (m: string) => (escapeHtml ? m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : m).trim();

    // Protect currency amounts: e.g. $15, $25.50, $1,000
    const CURRENCY_REGEX = /\$(\d+(?:,\d{3})*(?:\.\d{1,2})?)(?=\s|[.,;!?]|$)/g;
    if (currency) text = text.replace(CURRENCY_REGEX, `${CURRENCY_TOKEN}$1`);

    // Replace display math $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(tex(math), { displayMode: true, throwOnError: false, strict: 'ignore' });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Replace \[...\] display math
    text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
      try {
        return katex.renderToString(tex(math), { displayMode: true, throwOnError: false, strict: 'ignore' });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Replace inline math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      // If it looks purely like a price or plain number without math symbols, leave it
      if (currency && /^\s*\d+([.,]\d+)?\s*$/.test(math)) {
        return match;
      }
      try {
        return katex.renderToString(tex(math), { displayMode: false, throwOnError: false, strict: 'ignore' });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Replace \(...\) inline math
    text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
      try {
        return katex.renderToString(tex(math), { displayMode: false, throwOnError: false, strict: 'ignore' });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Restore currency and escaped dollars
    text = text.replace(new RegExp(CURRENCY_TOKEN, 'g'), '$');
    text = text.replace(new RegExp(ESCAPED_DOLLAR, 'g'), '$');

    return text;
  }, [content, currency, escapeHtml]);

  const Tag = block ? 'div' : 'span';
  return (
    <Tag
      className={`math-rendered-content ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

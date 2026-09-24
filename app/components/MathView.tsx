'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MathView({ content, className = '', style }: MathViewProps) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Regex to match:
    // 1. Display math: $$...$$
    // 2. Inline math: $...$ (making sure it's not empty, not escaped, and doesn't match single dollar currency like $50)
    // 3. \(...\) inline math or \[...\] display math
    
    // First, protect literal escaped dollars \$
    const ESCAPED_DOLLAR = '___ESCAPED_DOLLAR___';
    let text = content.replace(/\\\$/g, ESCAPED_DOLLAR);

    // Replace display math $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Replace \[...\] display math
    text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Replace inline math $...$
    // Ensure we don't accidentally match currency like "$50 and $100" by requiring math-like tokens or no spaces directly inside delimiters
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      // If it looks purely like a price or plain number without math symbols, leave it
      if (/^\s*\d+([.,]\d+)?\s*$/.test(math)) {
        return match;
      }
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Replace \(...\) inline math
    text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (err) {
        return `<span class="katex-error">${math}</span>`;
      }
    });

    // Restore escaped dollars
    text = text.replace(new RegExp(ESCAPED_DOLLAR, 'g'), '$');

    return text;
  }, [content]);

  return (
    <span
      className={`math-rendered-content ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

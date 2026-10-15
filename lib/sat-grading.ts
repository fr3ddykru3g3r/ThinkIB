// Answer checking that mirrors Bluebook's rules.
//
// Student-produced responses (SPR) follow the College Board entry directions:
//  - up to 5 characters for a positive answer, 6 for a negative one (the "-" counts)
//  - fractions and decimals are both fine; fractions don't need to be reduced
//  - a decimal that doesn't fit must be truncated or rounded to fill all 5/6 characters
//    (the question bank lists those forms, e.g. ".1764, .1765, 3/17")
//  - mixed numbers ("3 1/2"), %, $, commas and units are not accepted

export interface GradableQuestion {
  type?: 'mcq' | 'spr';
  choices?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
}

export function isSPR(q: GradableQuestion): boolean {
  if (q.type) return q.type === 'spr';
  return !q.choices || q.choices.length === 0;
}

const SPR_PATTERN = /^-?(\d+\/\d+|\d+\.?\d*|\.\d+)$/;

export function normalizeSPR(raw: string): string {
  return (raw || '')
    .trim()
    .replace(/[−–—]/g, '-'); // unicode minus / dashes
}

export type SPRValidation = { ok: true } | { ok: false; reason: string };

export function validateSPR(raw: string): SPRValidation {
  const s = normalizeSPR(raw);
  if (!s) return { ok: false, reason: 'Enter an answer.' };
  if (/[%$,]/.test(s)) return { ok: false, reason: "Don't enter symbols such as %, $ or commas." };
  if (/\s/.test(s)) return { ok: false, reason: "Mixed numbers aren't accepted: enter 3 1/2 as 7/2 or 3.5." };
  if (!SPR_PATTERN.test(s)) {
    return { ok: false, reason: 'Enter a whole number, decimal, or fraction (e.g. 12, 3.5, 7/2).' };
  }
  const limit = s.startsWith('-') ? 6 : 5;
  if (s.length > limit) {
    return {
      ok: false,
      reason: `Too long: Bluebook allows ${limit} characters${s.startsWith('-') ? ' including the minus sign' : ''}. Round or truncate decimals, or use a fraction.`,
    };
  }
  if (/\/0+$/.test(s)) return { ok: false, reason: 'The denominator cannot be 0.' };
  return { ok: true };
}

type Parsed = { kind: 'fraction'; n: number; d: number } | { kind: 'decimal'; v: number; text: string } | { kind: 'integer'; v: number };

function parse(s: string): Parsed | null {
  s = normalizeSPR(s);
  if (!SPR_PATTERN.test(s)) return null;
  if (s.includes('/')) {
    const neg = s.startsWith('-');
    const [n, d] = s.replace('-', '').split('/').map(Number);
    if (!d) return null;
    return { kind: 'fraction', n: neg ? -n : n, d };
  }
  if (s.includes('.')) return { kind: 'decimal', v: Number(s), text: s };
  return { kind: 'integer', v: Number(s) };
}

function exactValue(p: Parsed): number {
  return p.kind === 'fraction' ? p.n / p.d : p.v;
}

const EPS = 1e-9;

/**
 * Evaluates student-produced response against accepted answer keys per College Board Bluebook rules:
 * - Direct string equality against normalized keys
 * - Fraction and exact decimal equivalence
 * - 3-decimal and 4-decimal truncated and rounded evaluations for non-terminating decimals (e.g. 2/3 -> .666, .667, 0.666, 0.667)
 * - Tolerates |userValue - target| <= 1e-3 when at least 3 significant decimal characters are provided
 */
export function evaluateSPR(userInput: string, correctAnswers: string[]): boolean {
  const s = normalizeSPR(userInput);
  const validation = validateSPR(s);
  if (!validation.ok) return false;

  const input = parse(s);
  if (!input) return false;

  const userVal = exactValue(input);

  for (const rawAns of correctAnswers) {
    const normAns = normalizeSPR(rawAns);
    // 1. Direct normalized string match
    if (s.toLowerCase() === normAns.toLowerCase()) {
      return true;
    }

    const ans = parse(rawAns);
    if (!ans) continue;

    const targetVal = exactValue(ans);

    // 2. Exact match within micro-epsilon
    if (Math.abs(userVal - targetVal) < EPS) {
      return true;
    }

    // 3. For non-terminating decimals or fractions (or decimals with repeating structure),
    // compute 3-decimal and 4-decimal truncated and rounded forms
    const isNegative = targetVal < 0;
    const sign = isNegative ? -1 : 1;
    const absTarget = Math.abs(targetVal);

    const trunc3 = sign * (Math.floor(absTarget * 1000) / 1000);
    const round3 = sign * (Math.round(absTarget * 1000) / 1000);
    const trunc4 = sign * (Math.floor(absTarget * 10000) / 10000);
    const round4 = sign * (Math.round(absTarget * 10000) / 10000);

    const candidates = [trunc3, round3, trunc4, round4];
    for (const c of candidates) {
      if (Math.abs(userVal - c) < 1e-6) {
        return true;
      }
    }

    // If student entered a decimal with at least 3 digits after period (or 2 if leading minus),
    // accept if within 1e-3
    if (input.kind === 'decimal') {
      const decimals = input.text.replace(/^-?0*\./, '');
      if (decimals.length >= 2 && Math.abs(userVal - targetVal) <= 1e-3 + 1e-6) {
        return true;
      }
    }
  }

  return false;
}

/** Is a student-produced response correct against the list of accepted answers? */
export function gradeSPR(raw: string, accepted: string[]): boolean {
  return evaluateSPR(raw, accepted);
}

export function isAnswerCorrect(q: GradableQuestion, answer: string | undefined | null): boolean {
  if (!answer) return false;
  if (isSPR(q)) {
    const accepted = q.acceptedAnswers && q.acceptedAnswers.length ? q.acceptedAnswers : [q.correctAnswer];
    return gradeSPR(answer, accepted);
  }
  return answer.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
}

/** Human-readable correct answer, e.g. "3/17 (also .1764 or .1765)". */
export function formatCorrectAnswer(q: GradableQuestion): string {
  if (!isSPR(q)) return q.correctAnswer;
  const acc = q.acceptedAnswers && q.acceptedAnswers.length ? q.acceptedAnswers : [q.correctAnswer];
  return acc.join(', ');
}

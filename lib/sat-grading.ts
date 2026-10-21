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
 * Computes the exact valid Bluebook string representations for a target value.
 * Non-terminating decimals (e.g. 2/3) must fill the 5-character grid (or 6 for negative).
 * Under-filled approximations like ".66" or "0.67" are strictly rejected.
 */
function getValidBluebookRepresentations(targetVal: number): Set<string> {
  const reps = new Set<string>();
  const isNeg = targetVal < 0;
  const abs = Math.abs(targetVal);

  // Check if target is a terminating decimal with <= 4 decimal places (e.g. 0.25, 0.125)
  const isTerminating = Math.abs(abs * 10000 - Math.round(abs * 10000)) < 1e-7;
  if (isTerminating) {
    const str = abs.toString();
    if (isNeg) {
      reps.add(`-${str}`);
      if (str.startsWith('0.')) reps.add(`-.${str.slice(2)}`);
    } else {
      reps.add(str);
      if (str.startsWith('0.')) reps.add(`.${str.slice(2)}`);
    }
  }

  // Terminating values are matched exactly in evaluateSPR; only non-terminating
  // ones get the grid-filling truncated & rounded forms.
  if (isTerminating) return reps;

  if (!isNeg) {
    const t3 = (Math.floor(abs * 1000) / 1000).toFixed(3); // e.g. "0.666"
    const r3 = (Math.round(abs * 1000) / 1000).toFixed(3); // e.g. "0.667"
    reps.add(t3);                   // "0.666" (5 chars)
    reps.add(r3);                   // "0.667" (5 chars)

    const t4 = (Math.floor(abs * 10000) / 10000).toFixed(4); // e.g. "0.6666"
    const r4 = (Math.round(abs * 10000) / 10000).toFixed(4); // e.g. "0.6667"
    reps.add(t4.replace(/^0/, '')); // ".6666" (5 chars)
    reps.add(r4.replace(/^0/, '')); // ".6667" (5 chars)
  } else {
    // Negative numbers: max 6 characters including '-'
    const t3 = (Math.floor(abs * 1000) / 1000).toFixed(3);
    const r3 = (Math.round(abs * 1000) / 1000).toFixed(3);
    reps.add(`-${t3}`);             // "-0.333" (6 chars)
    reps.add(`-${r3}`);             // "-0.334" (6 chars)

    const t4 = (Math.floor(abs * 10000) / 10000).toFixed(4);
    const r4 = (Math.round(abs * 10000) / 10000).toFixed(4);
    reps.add(`-.${t4.slice(2)}`);   // "-.3333" (6 chars)
    reps.add(`-.${r4.slice(2)}`);   // "-.3334" (6 chars)
  }

  return reps;
}

/**
 * Evaluates student-produced response against accepted answer keys per College Board Bluebook rules:
 * - Direct string equality against normalized keys
 * - Equivalent fractions (e.g. 4/6 for 2/3)
 * - Valid truncated and rounded decimals that fill the required character grid
 * - Strict rejection of under-filled approximations like ".66" or "0.67"
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

    // 2. Exact match within micro-epsilon (for fractions and terminating decimals)
    if (Math.abs(userVal - targetVal) < EPS) {
      // If user provided a fraction, any equivalent unreduced fraction is accepted
      if (input.kind === 'fraction') {
        return true;
      }
      // Integers and exact decimals (e.g. "1.0", "0.50" for 1/2) are accepted
      if (input.kind === 'integer' || input.kind === 'decimal') {
        return true;
      }
    }

    // 3. Decimal evaluation against official Bluebook representations
    const validReps = getValidBluebookRepresentations(targetVal);
    if (validReps.has(s)) {
      return true;
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

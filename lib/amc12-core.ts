/**
 * lib/amc12-core.ts
 * Data-free AMC 12 types and helpers, safe to import from client components
 * (lib/amc12.ts pulls in the full topic JSON and is for server code).
 */

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E';
export const LETTERS: Letter[] = ['A', 'B', 'C', 'D', 'E'];

export interface Concept {
  title: string;
  body: string;
  keyFacts: string[];
  whenToUse: string;
}

export interface WorkedExample {
  title: string;
  difficulty: number;
  problem: string;
  choices: string[];
  answer: Letter;
  steps: string[];
  takeaway: string;
}

export interface Problem {
  id: string;
  topicId: string;
  difficulty: number;
  problem: string;
  choices: string[];
  answer: Letter;
  hint: string;
  solution: string;
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  examWeight: string;
  concepts: Concept[];
  workedExamples: WorkedExample[];
  problems: Problem[];
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Warm-up · #1–5',
  2: 'Easy · #6–10',
  3: 'Medium · #11–15',
  4: 'Hard · #16–20',
  5: 'Final five · #21–25',
};

/** Official AMC 12 scoring: 6 per correct answer, 1.5 per blank, 0 per wrong. */
export function amcScore(correct: number, blank: number): number {
  return correct * 6 + blank * 1.5;
}

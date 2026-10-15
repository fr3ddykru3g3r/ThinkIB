// Client-safe SAT types (lib/sat.ts uses fs and must stay server-only).
// Data is produced by scripts/extract-sat-from-pdf.py.

export interface SATRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A sprite sheet holding every crop for one question. 'ink' sheets are black-on-transparent (recoloured in dark mode). */
export interface SATSheet {
  src: string;
  w: number;
  h: number;
  mode: 'ink' | 'color';
  /** pixels per PDF point */
  scale: number;
}

export type SATBlock =
  | { type: 'text'; html: string }
  | ({ type: 'img'; alt: string } & SATRect);

export type SATDifficulty = 'Easy' | 'Medium' | 'Hard';

export type SATExamDifficultyMode =
  | 'adaptive'       // Standard Bluebook: Mixed Mod 1 -> IRT-routed Mod 2
  | 'medium'         // Foundation Builder (600-700 target): 75% Medium, 25% Hard
  | 'hard'           // High-Scorer Track (700-760 target): 25% Medium, 75% Hard, Force Upper Mod 2
  | 'hard_gauntlet'; // 750-800 Gauntlet: 100% Hard + Examiner Trap priority across both modules

export interface SATExamConfig {
  section: 'full' | 'math' | 'rw';
  difficultyMode: SATExamDifficultyMode;
  excludeSeenQuestions?: boolean;
  timerMode?: 'standard' | 'untimed' | 'accelerated_0.8x';
}

export interface SATQuestion {
  questionId: string;
  section?: 'reading-writing' | 'math';
  pageNumber: number;
  exam: string;
  domain: string;
  skill: string;
  difficulty: SATDifficulty;
  type?: 'mcq' | 'spr';
  /** Plain-text stem (search, alt text, legacy). */
  prompt: string;
  stem?: SATBlock[];
  /** Choice text (may be '' when the choice is an image in choiceMedia). */
  choices: string[];
  choiceMedia?: SATRect[][];
  /** 'A'–'D' for multiple choice; first accepted form for SPR. */
  correctAnswer: string;
  acceptedAnswers?: string[];
  rationale: string;
  rationaleBlocks?: SATBlock[];
  sheet?: SATSheet;
  rationaleSheet?: SATSheet;
  /** Legacy fields kept for older consumers. */
  broadArchetype?: string;
  conceptLabel?: string;
  /** Exam only: unscored pretest item (2 per module on the real test). */
  pretest?: boolean;
}

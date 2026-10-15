// Digital SAT score estimation.
//
// The real test is scored with Item Response Theory: each operational question has
// College Board-calibrated parameters, and the scale score comes from the ability
// estimate, so *which* questions you get right (and which Module 2 you were routed to)
// matters, not just how many. The exact parameters aren't public, so we use a 3PL
// model with parameters derived from the question bank's difficulty labels. It
// reproduces the important behaviour of the real scale: a perfect hard route earns 800,
// and the easier Module 2 caps the reachable score.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ScoredItem {
  difficulty: Difficulty | string;
  correct: boolean;
  /** Unscored pretest items are excluded, as on the real test. */
  scored?: boolean;
  /** Multiple-choice items can be guessed (c≈0.25); SPR items can't. */
  type?: 'mcq' | 'spr';
}

const B: Record<string, number> = { Easy: -1.25, Medium: 0.1, Hard: 1.35 };
const A = 1.25; // discrimination
const D = 1.7;

function pCorrect(theta: number, it: ScoredItem): number {
  const b = B[it.difficulty as string] ?? 0;
  const c = it.type === 'spr' ? 0 : 0.2;
  return c + (1 - c) / (1 + Math.exp(-D * A * (theta - b)));
}

/** MAP ability estimate (grid search) with a weak N(0, 1.5²) prior. */
export function estimateTheta(items: ScoredItem[]): number {
  const scored = items.filter((i) => i.scored !== false);
  if (!scored.length) return -3;
  let best = -4;
  let bestLL = -Infinity;
  for (let t = -4; t <= 4.0001; t += 0.01) {
    let ll = -(t * t) / (2 * 1.5 * 1.5);
    for (const it of scored) {
      const p = Math.min(0.9999, Math.max(0.0001, pCorrect(t, it)));
      ll += it.correct ? Math.log(p) : Math.log(1 - p);
    }
    if (ll > bestLL) {
      bestLL = ll;
      best = t;
    }
  }
  return best;
}

// θ → scale anchors, tuned so simulated raw scores land near published Bluebook
// practice-test conversions (e.g. Math 40/44 on the harder route ≈ 730–750,
// 21/44 on the easier route ≈ 450–480).
const SCALE: [number, number][] = [
  [-4, 200], [-2, 290], [-1, 380], [0, 480], [0.6, 560], [1.1, 640],
  [1.8, 730], [2.4, 780], [2.9, 800],
];

/** θ → 200–800 section score (rounded to 10, like the real scale). */
export function thetaToSection(theta: number, allCorrect: boolean, noneCorrect: boolean): number {
  if (allCorrect) return 800;
  if (noneCorrect) return 200;
  let raw = 800;
  for (let i = 1; i < SCALE.length; i++) {
    const [t1, s1] = SCALE[i];
    const [t0, s0] = SCALE[i - 1];
    if (theta <= t1) {
      raw = s0 + ((Math.max(theta, t0) - t0) / (t1 - t0)) * (s1 - s0);
      break;
    }
  }
  return Math.max(200, Math.min(790, Math.round(raw / 10) * 10));
}

export function scoreSection(items: ScoredItem[]): { score: number; theta: number; correct: number; total: number } {
  const scored = items.filter((i) => i.scored !== false);
  const correct = scored.filter((i) => i.correct).length;
  const theta = estimateTheta(items);
  const score = thetaToSection(theta, scored.length > 0 && correct === scored.length, correct === 0);
  return { score, theta, correct, total: scored.length };
}

// Approximate total-score percentiles ("SAT User" group), College Board 2024 report.
const PERCENTILES: [number, number][] = [
  [400, 1], [600, 1], [650, 2], [700, 5], [750, 10], [800, 15], [850, 21], [900, 28],
  [950, 36], [1000, 44], [1050, 52], [1100, 60], [1150, 68], [1200, 75], [1250, 81],
  [1300, 87], [1350, 91], [1400, 94], [1450, 97], [1500, 98], [1550, 99], [1600, 99],
];

export function totalPercentile(total: number): number {
  for (let i = 1; i < PERCENTILES.length; i++) {
    const [s1, p1] = PERCENTILES[i];
    const [s0, p0] = PERCENTILES[i - 1];
    if (total <= s1) return Math.round(p0 + ((total - s0) / (s1 - s0)) * (p1 - p0));
  }
  return 99;
}

export interface SATScoreReport {
  totalScore: number;
  rwScore: number;
  mathScore: number;
  percentile: number;
  rwCorrect: number;
  totalRW: number;
  mathCorrect: number;
  totalMath: number;
  /** ±range: practice-test estimates carry real uncertainty (College Board reports ~±30–40 per section). */
  rwRange: [number, number];
  mathRange: [number, number];
}

export function scoreExam(rwItems: ScoredItem[], mathItems: ScoredItem[]): SATScoreReport {
  const rw = scoreSection(rwItems);
  const math = scoreSection(mathItems);
  const totalScore = rw.score + math.score;
  const band = (s: number): [number, number] => [Math.max(200, s - 30), Math.min(800, s + 30)];
  return {
    totalScore,
    rwScore: rw.score,
    mathScore: math.score,
    percentile: totalPercentile(totalScore),
    rwCorrect: rw.correct,
    totalRW: rw.total,
    mathCorrect: math.correct,
    totalMath: math.total,
    rwRange: band(rw.score),
    mathRange: band(math.score),
  };
}

/** Routing after Module 1 (College Board doesn't publish the cut; ~60% on a mixed module is the commonly observed threshold). */
export function routesToHardModule(m1: ScoredItem[]): boolean {
  const scored = m1.filter((i) => i.scored !== false);
  if (!scored.length) return false;
  return estimateTheta(m1) >= 0.3;
}

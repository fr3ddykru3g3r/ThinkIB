/**
 * lib/srs-engine.ts
 * Unified Free Spaced Repetition Scheduler (FSRS) State Machine.
 * Unifies SAT Mistake Vault, AMC/AIME contest errors, and IB flashcards
 * into a single active recall queue.
 */

'use client';

export type SRSSource = 'sat' | 'amc' | 'ib';
export type SRSErrorTag = 'concept_gap' | 'examiner_trap' | 'careless_calc' | 'time_pressure';

export interface SRSHistoryLog {
  timestamp: number;
  rating: 1 | 2 | 3 | 4;
  stability: number;
  intervalDays: number;
}

export interface SRSItem {
  id: string; // e.g. "sat_q123" or "amc_2022_18"
  source: SRSSource;
  refId: string;
  title: string;
  prompt: string;
  answer: string;
  explanation?: string;
  errorTag?: SRSErrorTag;
  
  // FSRS state parameters
  stability: number;   // S: memory stability in days
  difficulty: number;  // D: 1.0 (easiest) to 10.0 (hardest)
  reps: number;        // total successful reviews
  lapses: number;      // total forgotten reviews (rating = 1)
  lastReviewedAt: number; // unix ms
  dueAt: number;       // unix ms
  
  history: SRSHistoryLog[];
}

const STORAGE_KEY = 'thinkib:fsrs-queue-v1';
const FSRS_FACTOR = 19 / 81; // ~0.23457
const TARGET_RETENTION = 0.90;

/**
 * Calculates retrievability R(t, S) = (1 + FACTOR * (t / S))^-1
 * where t is elapsed days since last review and S is stability in days.
 */
export function calculateRetrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FSRS_FACTOR * elapsedDays) / stability, -1);
}

/**
 * Load all items from localStorage
 */
export function getSRSQueue(): SRSItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load FSRS queue', err);
    return [];
  }
}

/**
 * Save all items to localStorage
 */
export function saveSRSQueue(items: SRSItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save FSRS queue', err);
  }
}

/**
 * Returns items currently due for active recall (dueAt <= Date.now())
 */
export function getDueSRSItems(): SRSItem[] {
  const queue = getSRSQueue();
  const now = Date.now();
  return queue.filter((item) => item.dueAt <= now);
}

/**
 * Enqueue or update an item in the FSRS state machine
 */
export function enqueueItem(params: {
  id: string;
  source: SRSSource;
  refId: string;
  title: string;
  prompt: string;
  answer: string;
  explanation?: string;
  errorTag?: SRSErrorTag;
}): SRSItem {
  const queue = getSRSQueue();
  const existingIdx = queue.findIndex((i) => i.id === params.id);
  const now = Date.now();

  if (existingIdx >= 0) {
    const existing = queue[existingIdx];
    existing.prompt = params.prompt;
    existing.answer = params.answer;
    if (params.explanation) existing.explanation = params.explanation;
    if (params.errorTag) existing.errorTag = params.errorTag;
    saveSRSQueue(queue);
    return existing;
  }

  // Create new card with initial FSRS priors
  const newItem: SRSItem = {
    id: params.id,
    source: params.source,
    refId: params.refId,
    title: params.title,
    prompt: params.prompt,
    answer: params.answer,
    explanation: params.explanation,
    errorTag: params.errorTag,
    stability: 1.0,  // initial stability = 1 day
    difficulty: 5.0, // initial medium difficulty
    reps: 0,
    lapses: 0,
    lastReviewedAt: 0,
    dueAt: now,      // immediately due for first calibration review
    history: [],
  };

  queue.push(newItem);
  saveSRSQueue(queue);
  return newItem;
}

/**
 * Process a review of an item with FSRS update formulas
 * rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 */
export function processReview(itemId: string, rating: 1 | 2 | 3 | 4): SRSItem | null {
  const queue = getSRSQueue();
  const item = queue.find((i) => i.id === itemId);
  if (!item) return null;

  const now = Date.now();
  let S = item.stability;
  let D = item.difficulty;
  let nextIntervalDays = 1.0;

  if (rating === 1) {
    // Lapse / Again: Stability collapses, difficulty increases
    item.lapses += 1;
    S = Math.max(0.4, S * 0.25);
    D = Math.min(10.0, D + 1.6);
    nextIntervalDays = 0.2; // Review in ~5 hours or same day
  } else if (rating === 2) {
    // Hard: Minimal stability growth, slight difficulty increase
    item.reps += 1;
    S = S * 1.25;
    D = Math.min(10.0, D + 0.6);
    nextIntervalDays = Math.max(1.0, S * 0.85);
  } else if (rating === 3) {
    // Good: Standard exponential stability growth
    item.reps += 1;
    S = S * 2.4;
    D = Math.max(1.0, D - 0.2);
    nextIntervalDays = Math.max(1.0, S);
  } else {
    // Easy: Aggressive stability boost, difficulty drops
    item.reps += 1;
    S = S * 4.2;
    D = Math.max(1.0, D - 0.8);
    nextIntervalDays = Math.max(2.0, S * 1.4);
  }

  item.stability = Number(S.toFixed(2));
  item.difficulty = Number(D.toFixed(2));
  item.lastReviewedAt = now;
  item.dueAt = now + Math.round(nextIntervalDays * 86400 * 1000);

  item.history.push({
    timestamp: now,
    rating,
    stability: item.stability,
    intervalDays: Number(nextIntervalDays.toFixed(2)),
  });

  saveSRSQueue(queue);
  return item;
}

/**
 * Synchronize unmastered questions from the SAT Mistake Vault
 */
export function syncFromSATVault(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('sat_mistake_vault_v1');
    if (!raw) return 0;
    const mistakes = JSON.parse(raw);
    let addedCount = 0;

    for (const m of mistakes) {
      if (!m.mastered) {
        const id = `sat_${m.questionId}`;
        enqueueItem({
          id,
          source: 'sat',
          refId: m.questionId,
          title: `SAT ${m.section === 'math' ? 'Math' : 'Reading/Writing'} (${m.domain})`,
          prompt: m.prompt || `SAT Question ${m.questionId}`,
          answer: m.correctAnswer,
          explanation: m.rationale,
          errorTag: m.errorTag,
        });
        addedCount++;
      }
    }
    return addedCount;
  } catch (e) {
    return 0;
  }
}

/**
 * Synchronize questions from AMC / AIME error tags
 */
export function syncFromAMCVault(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('thinkib:amc-error-tags');
    if (!raw) return 0;
    const tags = JSON.parse(raw);
    let addedCount = 0;

    for (const [probId, tag] of Object.entries(tags)) {
      const id = `amc_${probId}`;
      enqueueItem({
        id,
        source: 'amc',
        refId: probId,
        title: `Contest Problem ${probId}`,
        prompt: `Review contest problem ${probId}`,
        answer: 'Verified contest solution',
        errorTag: tag as SRSErrorTag,
      });
      addedCount++;
    }
    return addedCount;
  } catch (e) {
    return 0;
  }
}

/**
 * Aggregate summary statistics of the FSRS queue
 */
export function getSRSStats() {
  const queue = getSRSQueue();
  const now = Date.now();
  const due = queue.filter((i) => i.dueAt <= now);
  
  const bySource = {
    sat: queue.filter((i) => i.source === 'sat').length,
    amc: queue.filter((i) => i.source === 'amc').length,
    ib: queue.filter((i) => i.source === 'ib').length,
  };

  // Retention estimate based on retrievabilities
  let totalRetrievability = 0;
  queue.forEach((item) => {
    if (item.lastReviewedAt > 0) {
      const elapsedDays = (now - item.lastReviewedAt) / (86400 * 1000);
      totalRetrievability += calculateRetrievability(elapsedDays, item.stability);
    } else {
      totalRetrievability += 0.5;
    }
  });

  const avgRetention = queue.length > 0 ? (totalRetrievability / queue.length) * 100 : 92.5;

  return {
    totalCount: queue.length,
    dueTodayCount: due.length,
    bySource,
    retentionRate: Number(avgRetention.toFixed(1)),
  };
}

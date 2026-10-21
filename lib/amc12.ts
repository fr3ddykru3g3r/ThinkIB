/**
 * lib/amc12.ts
 * Loads the AMC 12 topic files (data/amc12/topics/*.json), strips the
 * server-only `verify` code, and builds topic/mixed/mock problem sets.
 * Content schema: data/amc12/SCHEMA.md
 */

import algebra from '@/data/amc12/topics/algebra.json';
import functionsLogs from '@/data/amc12/topics/functions-logs.json';
import sequencesSeries from '@/data/amc12/topics/sequences-series.json';
import numberTheory from '@/data/amc12/topics/number-theory.json';
import counting from '@/data/amc12/topics/counting.json';
import probability from '@/data/amc12/topics/probability.json';
import geometry from '@/data/amc12/topics/geometry.json';
import trigComplex from '@/data/amc12/topics/trig-complex.json';

import type { Topic, WorkedExample, Problem } from './amc12-core';
export * from './amc12-core';

type RawTopic = Omit<Topic, 'problems' | 'workedExamples'> & {
  workedExamples: (WorkedExample & { verify?: string })[];
  problems: (Omit<Problem, 'topicId'> & { verify?: string })[];
};

function clean(raw: RawTopic): Topic {
  return {
    ...raw,
    workedExamples: raw.workedExamples.map(({ verify, ...ex }) => ex),
    problems: raw.problems.map(({ verify, ...p }) => ({ ...p, topicId: raw.id })),
  };
}

export const TOPICS: Topic[] = [
  algebra, functionsLogs, sequencesSeries, numberTheory,
  counting, probability, geometry, trigComplex,
].map((t) => clean(t as RawTopic));

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export const ALL_PROBLEMS: Problem[] = TOPICS.flatMap((t) => t.problems);

/** Mulberry32: small deterministic PRNG so mock N is the same paper every time. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const MOCK_COUNT = 4;

/**
 * Mock paper N: 25 problems, five from each difficulty band, ordered easy → hard
 * like a real AMC 12. Mocks are disjoint where the pool allows it.
 */
export function buildMock(n: number): Problem[] {
  const paper: Problem[] = [];
  for (let d = 1; d <= 5; d++) {
    const band = shuffled(ALL_PROBLEMS.filter((p) => p.difficulty === d), rng(1000 + d));
    const start = ((n - 1) * 5) % band.length;
    const picked = [...band, ...band].slice(start, start + 5);
    paper.push(...shuffled(picked, rng(n * 31 + d)));
  }
  return paper;
}

/** Mixed drill: `count` random problems across all topics, sorted by difficulty. */
export function buildMixed(count: number, seed: number): Problem[] {
  return shuffled(ALL_PROBLEMS, rng(seed))
    .slice(0, count)
    .sort((a, b) => a.difficulty - b.difficulty);
}

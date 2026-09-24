import fs from 'fs';
import path from 'path';

export interface ForumThread {
  id: string;
  title: string;
  channel: 'all' | 'sat-prep' | 'math-analysis' | 'sciences' | 'humanities' | 'general';
  author: string;
  authorBadge?: string;
  content: string;
  tags: string[];
  upvotes: number;
  repliesCount: number;
  createdAt: string;
  pinned?: boolean;
}

export interface ForumReply {
  id: string;
  threadId: string;
  author: string;
  authorBadge?: string;
  content: string;
  createdAt: string;
  isSolution?: boolean;
}

export interface ResourceSubmission {
  id: string;
  title: string;
  originalTitle: string;
  url: string;
  exam: 'IB' | 'SAT' | 'AP' | 'Other';
  subject: string;
  subtopic: string;
  resourceType: 'pdf' | 'notes' | 'video' | 'practice' | 'cheatsheet' | 'portal';
  rationale: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  qualityScore?: number;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  standardizedTitle?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');

const INITIAL_THREADS: ForumThread[] = [];
const INITIAL_REPLIES: ForumReply[] = [];

const INITIAL_SUBMISSIONS: ResourceSubmission[] = [
  {
    id: 'sub-1',
    title: 'Erica Meltzer Digital SAT Grammar & Reading Rules Master Summary',
    originalTitle: 'erica meltzer grammar cheat sheet notes',
    url: 'https://thecriticalreader.com/complete-sat-grammar-rules/',
    exam: 'SAT',
    subject: 'Reading and Writing',
    subtopic: 'Standard English Conventions & Transitions',
    resourceType: 'notes',
    rationale: 'Comprehensive breakdown of all tested punctuation, clause boundaries, and rhetorical transitions for the new adaptive Digital SAT.',
    submittedBy: 'Karan S.',
    status: 'approved',
    qualityScore: 96,
    reviewNotes: 'Verified authoritative source. Exceptional alignment with Digital SAT Reading/Writing taxonomy. Promoted to verified vault.',
    reviewedAt: '2026-09-21T00:00:00Z',
    createdAt: '2026-09-18T10:00:00Z',
    standardizedTitle: 'Erica Meltzer SAT Grammar Rule Summary & Drill Guide',
  },
  {
    id: 'sub-2',
    title: 'Khan Academy Official Digital SAT Math Mastery Track',
    originalTitle: 'khan academy official dsat',
    url: 'https://www.khanacademy.org/test-prep/digital-sat',
    exam: 'SAT',
    subject: 'Mathematics & Reading',
    subtopic: 'Full Curriculum (Foundations to Advanced)',
    resourceType: 'portal',
    rationale: 'Official College Board partnership lessons with diagnostic quizzes, video walkthroughs, and targeted practice problems.',
    submittedBy: 'Aarav Mehta',
    status: 'approved',
    qualityScore: 99,
    reviewNotes: 'Official College Board partner content. Indispensable for all score brackets. Approved.',
    reviewedAt: '2026-09-21T00:00:00Z',
    createdAt: '2026-09-19T14:20:00Z',
    standardizedTitle: 'Khan Academy Official Digital SAT Practice & Video Curriculum',
  },
  {
    id: 'sub-3',
    title: 'Scalar Learning YouTube Channel — 1600 Live Speedruns & Math Drills',
    originalTitle: 'scalar learning Huzefa math channel',
    url: 'https://www.youtube.com/@ScalarLearning',
    exam: 'SAT',
    subject: 'Mathematics',
    subtopic: 'Real-time Math Problem Solving & Timed Tests',
    resourceType: 'video',
    rationale: 'Best real-time SAT math test solver online showing pacing, Desmos shortcuts, and mental math strategies.',
    submittedBy: 'David Kim',
    status: 'approved',
    qualityScore: 94,
    reviewNotes: 'High pedagogical value. Great pacing demonstrations for time management in Module 2.',
    reviewedAt: '2026-09-21T00:00:00Z',
    createdAt: '2026-09-20T11:00:00Z',
    standardizedTitle: 'Scalar Learning Real-Time SAT Math Walkthroughs & Speedruns',
  },
  {
    id: 'sub-4',
    title: 'Random SAT vocabulary flashcard list on quizlet from 2014',
    originalTitle: 'sat vocab 2014 old format',
    url: 'https://example.com/dead-link-old-vocab',
    exam: 'SAT',
    subject: 'Reading and Writing',
    subtopic: 'Obsolete Vocabulary Lists',
    resourceType: 'cheatsheet',
    rationale: 'Old vocab lists found on forum.',
    submittedBy: 'Anonymous',
    status: 'rejected',
    qualityScore: 28,
    reviewNotes: 'Rejected: Targets the pre-2016 paper SAT format with obsolete rote vocabulary words (e.g. esoteric antonyms) not aligned with Digital SAT in-context vocabulary.',
    reviewedAt: '2026-09-21T00:00:00Z',
    createdAt: '2026-09-20T17:15:00Z',
    standardizedTitle: 'Legacy 2014 Paper SAT Obsolete Word List',
  },
  {
    id: 'sub-5',
    title: 'PrepPros 150 Hardest Digital SAT Math Questions Walkthrough',
    originalTitle: 'preppros hard math video',
    url: 'https://www.youtube.com/watch?v=sample-preppros-hard-sat',
    exam: 'SAT',
    subject: 'Mathematics',
    subtopic: 'Module 2 Hard Tier Problems & 750+ Benchmarks',
    resourceType: 'video',
    rationale: 'Clear step-by-step techniques for circle theorems, vertex form transformations, and constants solving.',
    submittedBy: 'Elena V.',
    status: 'pending',
    createdAt: '2026-09-23T18:40:00Z',
  },
  {
    id: 'sub-6',
    title: 'BioNinja IB DP Biology Syllabus 2025 Revision Notes',
    originalTitle: 'bioninja notes',
    url: 'https://ib.bioninja.com.au',
    exam: 'IB',
    subject: 'Biology',
    subtopic: 'Standard Level and Higher Level Complete Syllabus',
    resourceType: 'notes',
    rationale: 'Classic IB visual summaries and diagram annotations for cell biology, molecular genetics, and ecology.',
    submittedBy: 'Maya P.',
    status: 'pending',
    createdAt: '2026-09-24T08:15:00Z',
  },
];

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // In restricted environments, fallback gracefully
  }
}

function readJSONFile<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[DB] Error reading ${filename}, using fallback:`, err);
    return fallback;
  }
}

function writeJSONFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[DB] Error writing ${filename}:`, err);
  }
}

// ----------------------------------------------------
// FORUM THREADS API
// ----------------------------------------------------
export function getThreads(channel?: string, search?: string): ForumThread[] {
  let list = readJSONFile<ForumThread[]>('forum_threads.json', INITIAL_THREADS);
  
  if (channel && channel !== 'all') {
    list = list.filter((t) => t.channel === channel);
  }
  
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  
  // Pinned first, then newest
  return list.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getThreadById(id: string): { thread: ForumThread | null; replies: ForumReply[] } {
  const threads = readJSONFile<ForumThread[]>('forum_threads.json', INITIAL_THREADS);
  const replies = readJSONFile<ForumReply[]>('forum_replies.json', INITIAL_REPLIES);
  
  const thread = threads.find((t) => t.id === id) || null;
  const threadReplies = replies
    .filter((r) => r.threadId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
  return { thread, replies: threadReplies };
}

export function createThread(data: Omit<ForumThread, 'id' | 'upvotes' | 'repliesCount' | 'createdAt'>): ForumThread {
  const threads = readJSONFile<ForumThread[]>('forum_threads.json', INITIAL_THREADS);
  const newThread: ForumThread = {
    ...data,
    id: `thread-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    upvotes: 0,
    repliesCount: 0,
    createdAt: new Date().toISOString(),
  };
  
  threads.unshift(newThread);
  writeJSONFile('forum_threads.json', threads);
  return newThread;
}

export function addReply(threadId: string, author: string, content: string, authorBadge?: string): ForumReply {
  const replies = readJSONFile<ForumReply[]>('forum_replies.json', INITIAL_REPLIES);
  const threads = readJSONFile<ForumThread[]>('forum_threads.json', INITIAL_THREADS);
  
  const newReply: ForumReply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    threadId,
    author: author.trim() || 'Anonymous Scholar',
    authorBadge,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  
  replies.push(newReply);
  writeJSONFile('forum_replies.json', replies);
  
  // Update repliesCount on thread
  const threadIdx = threads.findIndex((t) => t.id === threadId);
  if (threadIdx !== -1) {
    threads[threadIdx].repliesCount = (threads[threadIdx].repliesCount || 0) + 1;
    writeJSONFile('forum_threads.json', threads);
  }
  
  return newReply;
}

export function upvoteThread(id: string): number {
  const threads = readJSONFile<ForumThread[]>('forum_threads.json', INITIAL_THREADS);
  const thread = threads.find((t) => t.id === id);
  if (thread) {
    thread.upvotes = (thread.upvotes || 0) + 1;
    writeJSONFile('forum_threads.json', threads);
    return thread.upvotes;
  }
  return 0;
}

// ----------------------------------------------------
// RESOURCE SUBMISSIONS & CURATION API
// ----------------------------------------------------
export function getSubmissions(status?: 'all' | 'pending' | 'approved' | 'rejected'): ResourceSubmission[] {
  let list = readJSONFile<ResourceSubmission[]>('resource_submissions.json', INITIAL_SUBMISSIONS);
  if (status && status !== 'all') {
    list = list.filter((s) => s.status === status);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createSubmission(
  data: Omit<ResourceSubmission, 'id' | 'status' | 'createdAt' | 'originalTitle'>
): ResourceSubmission {
  const submissions = readJSONFile<ResourceSubmission[]>('resource_submissions.json', INITIAL_SUBMISSIONS);
  const newSub: ResourceSubmission = {
    ...data,
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    originalTitle: data.title,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  submissions.unshift(newSub);
  writeJSONFile('resource_submissions.json', submissions);
  return newSub;
}

export function updateSubmissionStatus(
  id: string,
  update: {
    status: 'approved' | 'rejected';
    qualityScore: number;
    reviewNotes: string;
    standardizedTitle?: string;
  }
): ResourceSubmission | null {
  const submissions = readJSONFile<ResourceSubmission[]>('resource_submissions.json', INITIAL_SUBMISSIONS);
  const sub = submissions.find((s) => s.id === id);
  if (!sub) return null;
  
  sub.status = update.status;
  sub.qualityScore = update.qualityScore;
  sub.reviewNotes = update.reviewNotes;
  if (update.standardizedTitle) {
    sub.standardizedTitle = update.standardizedTitle;
    sub.title = update.standardizedTitle;
  }
  sub.reviewedAt = new Date().toISOString();
  
  writeJSONFile('resource_submissions.json', submissions);
  return sub;
}

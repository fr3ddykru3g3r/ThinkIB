import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
  lastAction: number;
}

// In-memory rate limiting stores (IP -> Record)
const threadRateLimits = new Map<string, RateLimitRecord>();
const replyRateLimits = new Map<string, RateLimitRecord>();
const submissionRateLimits = new Map<string, RateLimitRecord>();
const upvoteRecord = new Set<string>(); // "ip_threadId"

// Content spam triggers
const SPAM_KEYWORDS = [
  'casino',
  'free crypto',
  'crypto giveaway',
  'whatsapp group',
  'telegram group',
  't.me/',
  'wa.me/',
  'bit.ly/',
  'tinyurl.com/',
  'essay writing service',
  'pay for essay',
  'buy essay',
  'hire a hacker',
  'viagra',
  'cialis',
  'earn money fast',
  'free vbucks',
  'free robux',
  'weight loss miracle',
  'invest and double',
  'onlyfans.com',
  'adult content',
  'dating site',
  'cheap airfare glitch'
];

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

function checkSlidingRateLimit(
  store: Map<string, RateLimitRecord>,
  ip: string,
  maxRequests: number,
  windowMs: number,
  cooldownMs: number
): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const record = store.get(ip) || { timestamps: [], lastAction: 0 };

  // Check cooldown between consecutive actions
  if (now - record.lastAction < cooldownMs) {
    const waitSec = Math.ceil((cooldownMs - (now - record.lastAction)) / 1000);
    return {
      allowed: false,
      reason: `Please slow down. Wait ${waitSec} second${waitSec === 1 ? '' : 's'} before posting again.`
    };
  }

  // Filter timestamps within sliding window
  const recent = record.timestamps.filter(t => now - t < windowMs);
  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const waitMins = Math.ceil((windowMs - (now - oldest)) / 60000);
    return {
      allowed: false,
      reason: `Rate limit reached. Maximum ${maxRequests} posts per ${Math.round(windowMs / 60000)} minutes. Try again in ${waitMins} minute${waitMins === 1 ? '' : 's'}.`
    };
  }

  recent.push(now);
  store.set(ip, { timestamps: recent, lastAction: now });
  return { allowed: true };
}

// 1. Thread Rate Limiting: Max 3 threads per 10 mins, min 20s cooldown
export function checkThreadRateLimit(ip: string) {
  return checkSlidingRateLimit(threadRateLimits, ip, 3, 10 * 60 * 1000, 20 * 1000);
}

// 2. Reply Rate Limiting: Max 10 replies per 5 mins, min 4s cooldown
export function checkReplyRateLimit(ip: string) {
  return checkSlidingRateLimit(replyRateLimits, ip, 10, 5 * 60 * 1000, 4 * 1000);
}

// 3. Resource Submission Rate Limiting: Max 4 submissions per 10 mins, min 15s cooldown
export function checkSubmissionRateLimit(ip: string) {
  return checkSlidingRateLimit(submissionRateLimits, ip, 4, 10 * 60 * 1000, 15 * 1000);
}

// 4. Upvote Spam Prevention: 1 upvote per IP per thread
export function checkUpvoteSpam(ip: string, threadId: string): { allowed: boolean; reason?: string } {
  const key = `${ip}_${threadId}`;
  if (upvoteRecord.has(key)) {
    return {
      allowed: false,
      reason: 'You have already upvoted this thread.'
    };
  }
  upvoteRecord.add(key);
  // Cap memory size if needed
  if (upvoteRecord.size > 20000) {
    upvoteRecord.clear();
  }
  return { allowed: true };
}

// 5. Content Sanitization & Anti-Spam Heuristics
export interface ContentValidationResult {
  valid: boolean;
  sanitizedContent?: string;
  sanitizedTitle?: string;
  error?: string;
}

export function validateThreadContent(
  title: string,
  content: string,
  author: string,
  honeypot?: string
): ContentValidationResult {
  // Honeypot check: Bots fill out invisible fields
  if (honeypot && honeypot.trim().length > 0) {
    return { valid: false, error: 'Spam bot detected.' };
  }

  // Length boundaries
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedAuthor = author.trim();

  if (trimmedTitle.length < 5) {
    return { valid: false, error: 'Title is too short (minimum 5 characters required).' };
  }
  if (trimmedTitle.length > 150) {
    return { valid: false, error: 'Title exceeds maximum allowed length of 150 characters.' };
  }
  if (trimmedContent.length < 15) {
    return { valid: false, error: 'Content is too short (minimum 15 characters required).' };
  }
  if (trimmedContent.length > 10000) {
    return { valid: false, error: 'Content exceeds maximum allowed length of 10,000 characters.' };
  }
  if (trimmedAuthor.length > 35) {
    return { valid: false, error: 'Author name cannot exceed 35 characters.' };
  }

  // Character flood / keyboard smash (e.g. "aaaaaaaaaaaa" or "???????????")
  if (/(.)\1{7,}/.test(trimmedTitle) || /(.)\1{9,}/.test(trimmedContent)) {
    return { valid: false, error: 'Content contains unnatural repetitive characters or spam.' };
  }

  // ALL CAPS screaming detector (if over 25 chars and > 70% uppercase)
  const lettersOnly = trimmedTitle.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length > 25) {
    const uppercaseCount = lettersOnly.split('').filter(c => c >= 'A' && c <= 'Z').length;
    if (uppercaseCount / lettersOnly.length > 0.75) {
      return { valid: false, error: 'Please avoid writing titles in ALL CAPS.' };
    }
  }

  // Excessive URLs (Max 3 external links allowed in a thread)
  const urlMatches = trimmedContent.match(/https?:\/\/[^\s]+/gi) || [];
  if (urlMatches.length > 3) {
    return { valid: false, error: 'Spam protection: Threads cannot contain more than 3 external links.' };
  }

  // Keyword blacklist
  const lowerTitle = trimmedTitle.toLowerCase();
  const lowerContent = trimmedContent.toLowerCase();
  for (const kw of SPAM_KEYWORDS) {
    if (lowerTitle.includes(kw) || lowerContent.includes(kw)) {
      return { valid: false, error: `Content flagged by automated spam filter (${kw}).` };
    }
  }

  // Basic HTML / script tag escape to prevent stored XSS
  const sanitize = (str: string) =>
    str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  return {
    valid: true,
    sanitizedTitle: sanitize(trimmedTitle),
    sanitizedContent: sanitize(trimmedContent)
  };
}

export function validateReplyContent(
  content: string,
  author: string,
  honeypot?: string
): ContentValidationResult {
  if (honeypot && honeypot.trim().length > 0) {
    return { valid: false, error: 'Spam bot detected.' };
  }

  const trimmed = content.trim();
  const trimmedAuthor = author.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Reply is too short (minimum 3 characters).' };
  }
  if (trimmed.length > 5000) {
    return { valid: false, error: 'Reply exceeds maximum length of 5,000 characters.' };
  }
  if (trimmedAuthor.length > 35) {
    return { valid: false, error: 'Author name cannot exceed 35 characters.' };
  }

  // Repetition check
  if (/(.)\1{8,}/.test(trimmed)) {
    return { valid: false, error: 'Reply contains unnatural repetitive characters or spam.' };
  }

  // Max 2 URLs per reply
  const urlMatches = trimmed.match(/https?:\/\/[^\s]+/gi) || [];
  if (urlMatches.length > 2) {
    return { valid: false, error: 'Replies cannot contain more than 2 external links.' };
  }

  // Keyword check
  const lower = trimmed.toLowerCase();
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw)) {
      return { valid: false, error: `Reply flagged by automated spam filter (${kw}).` };
    }
  }

  const sanitize = (str: string) =>
    str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  return {
    valid: true,
    sanitizedContent: sanitize(trimmed)
  };
}

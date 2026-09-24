import { NextRequest, NextResponse } from 'next/server';
import { getThreads, createThread } from '@/lib/db';
import { getClientIP, checkThreadRateLimit, validateThreadContent } from '@/lib/anti-spam';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || undefined;
  const search = searchParams.get('search') || undefined;

  const threads = getThreads(channel, search);
  return NextResponse.json({ success: true, threads });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // 1. Rate Limiting Check
    const rateCheck = checkThreadRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.reason },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, channel, author, authorBadge, content, tags, hp_field } = body;

    // 2. Anti-Spam Content Validation & Honeypot
    const validation = validateThreadContent(
      title || '',
      content || '',
      author || 'Anonymous Scholar',
      hp_field
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 3. Duplicate Thread Check
    const existing = getThreads();
    const duplicate = existing.find(
      (t) =>
        t.title.toLowerCase().trim() === validation.sanitizedTitle!.toLowerCase().trim() &&
        Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000
    );
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'A thread with this exact title was posted recently. Please join the existing conversation.' },
        { status: 400 }
      );
    }

    const thread = createThread({
      title: validation.sanitizedTitle!,
      channel: channel || 'general',
      author: (author?.trim() || 'Anonymous Scholar').slice(0, 35),
      authorBadge: authorBadge?.trim(),
      content: validation.sanitizedContent!,
      tags: Array.isArray(tags) ? tags.slice(0, 5).map((t: string) => String(t).trim().slice(0, 25)) : [],
    });

    return NextResponse.json({ success: true, thread }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getThreadById, addReply } from '@/lib/db';
import { getClientIP, checkReplyRateLimit, validateReplyContent } from '@/lib/anti-spam';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = getThreadById(id);

  if (!result.thread) {
    return NextResponse.json(
      { success: false, error: 'Thread not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, ...result });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const ip = getClientIP(request);

    // 1. Rate Limiting Check
    const rateCheck = checkReplyRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.reason },
        { status: 429 }
      );
    }

    // Check thread existence
    const { thread, replies } = getThreadById(id);
    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { author, content, authorBadge, hp_field } = body;

    // 2. Anti-Spam Content Validation & Honeypot
    const validation = validateReplyContent(
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

    // 3. Duplicate Reply Check within 5 minutes
    const duplicate = replies.find(
      (r) =>
        r.content.toLowerCase().trim() === validation.sanitizedContent!.toLowerCase().trim() &&
        Date.now() - new Date(r.createdAt).getTime() < 5 * 60 * 1000
    );
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'You posted this exact reply a moment ago.' },
        { status: 400 }
      );
    }

    const reply = addReply(
      id,
      (author?.trim() || 'Anonymous Scholar').slice(0, 35),
      validation.sanitizedContent!,
      authorBadge?.trim()
    );

    return NextResponse.json({ success: true, reply }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}


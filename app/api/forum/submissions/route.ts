import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions, createSubmission } from '@/lib/db';
import { getClientIP, checkSubmissionRateLimit } from '@/lib/anti-spam';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get('status') as any) || 'all';

  const submissions = getSubmissions(status);
  return NextResponse.json({ success: true, submissions });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // 1. Rate Limiting Check
    const rateCheck = checkSubmissionRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.reason },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, url, exam, subject, subtopic, resourceType, rationale, submittedBy, hp_field } = body;

    // 2. Honeypot Check
    if (hp_field && hp_field.trim().length > 0) {
      return NextResponse.json(
        { success: false, error: 'Spam bot detected.' },
        { status: 400 }
      );
    }

    if (!title || !url || !rationale) {
      return NextResponse.json(
        { success: false, error: 'Title, URL, and rationale are required' },
        { status: 400 }
      );
    }

    // 3. Strict URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid web URL starting with https:// or http://' },
        { status: 400 }
      );
    }

    // 4. Duplicate URL Check
    const existing = getSubmissions();
    const duplicate = existing.find(
      (s) => s.url.toLowerCase().trim() === url.toLowerCase().trim()
    );
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'This exact resource URL has already been submitted to the vault.' },
        { status: 400 }
      );
    }

    const sub = createSubmission({
      title: title.trim().slice(0, 150),
      url: parsedUrl.toString(),
      exam: exam || 'SAT',
      subject: subject || 'General',
      subtopic: (subtopic?.trim() || 'Comprehensive').slice(0, 100),
      resourceType: resourceType || 'notes',
      rationale: rationale.trim().slice(0, 1000),
      submittedBy: (submittedBy?.trim() || 'Anonymous Scholar').slice(0, 35),
    });

    return NextResponse.json({ success: true, submission: sub }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}


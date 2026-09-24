import { NextRequest, NextResponse } from 'next/server';
import { querySATQuestions } from '@/lib/sat';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const section = (searchParams.get('section') as any) || 'all';
  const domain = searchParams.get('domain') || undefined;
  const skill = searchParams.get('skill') || undefined;
  const difficulty = (searchParams.get('difficulty') as any) || undefined;
  const hasChoicesOnly = searchParams.get('hasChoicesOnly') === 'true';
  const search = searchParams.get('search') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const randomize = searchParams.get('randomize') === 'true';

  const result = querySATQuestions({
    section,
    domain,
    skill,
    difficulty,
    hasChoicesOnly,
    search,
    limit,
    offset,
    randomize,
  });

  return NextResponse.json({
    success: true,
    ...result,
  });
}

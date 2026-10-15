import { NextRequest, NextResponse } from 'next/server';
import { querySATQuestions, getFacets, getQuestionsByIds } from '@/lib/sat';

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams;

  // /api/sat/questions?ids=a,b,c  -> exact lookup (Mistake Vault, review screens)
  const ids = sp.get('ids');
  if (ids) {
    const list = ids.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 100);
    return NextResponse.json({ success: true, questions: getQuestionsByIds(list) }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    });
  }

  const randomize = sp.get('randomize') === 'true';
  const type = sp.get('type');
  const result = querySATQuestions({
    section: (sp.get('section') as 'reading-writing' | 'math' | 'all') || 'all',
    domain: sp.get('domain') || undefined,
    skill: sp.get('skill') || undefined,
    difficulty: (sp.get('difficulty') as 'Easy' | 'Medium' | 'Hard') || undefined,
    type: type === 'mcq' || type === 'spr' ? type : undefined,
    search: sp.get('search') || undefined,
    limit: parseInt(sp.get('limit') || '20', 10),
    offset: parseInt(sp.get('offset') || '0', 10),
    randomize,
    excludeIds: sp.get('exclude')?.split(',').filter(Boolean),
  });

  // Random pulls must not be cached; deterministic ones can be.
  const cache = randomize ? 'no-store' : 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
  return NextResponse.json({ success: true, ...result, facets: getFacets() }, { headers: { 'Cache-Control': cache } });
}

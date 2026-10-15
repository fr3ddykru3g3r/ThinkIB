import { NextRequest, NextResponse } from 'next/server';
import { generateInitialFullSATExam, generateAdaptiveModule, generateSATExam, type SATExamConfig, type SATExamDifficultyMode } from '@/lib/sat';
import { routesToHardModule, scoreExam, type ScoredItem } from '@/lib/sat-scoring';

export const dynamic = 'force-dynamic';

// GET: fresh exam (Module 1s are final; Module 2s are placeholders until routing)
export async function GET() {
  return NextResponse.json({ success: true, exam: generateInitialFullSATExam() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // New exam that supports selectable difficulty modes and section scoping
    if (action === 'new_exam') {
      const seen = new Set<string>(Array.isArray(body.seenIds) ? body.seenIds.slice(0, 5000) : []);
      const config: SATExamConfig = body.config || {
        section: body.section || 'full',
        difficultyMode: body.difficultyMode || 'adaptive',
        timerMode: body.timerMode || 'standard',
      };
      return NextResponse.json({ success: true, exam: generateSATExam(config, seen) });
    }

    // Adaptive routing: decided from Module 1's scored items only (pretest items don't count)
    if (action === 'route_module') {
      const { section, items, excludeIds, seenIds, difficultyMode = 'adaptive', timerMode = 'standard' } = body as {
        section: 'reading-writing' | 'math';
        items: ScoredItem[];
        excludeIds?: string[];
        seenIds?: string[];
        difficultyMode?: SATExamDifficultyMode;
        timerMode?: 'standard' | 'untimed' | 'accelerated_0.8x';
      };

      const isHard = routesToHardModule(items || [], difficultyMode);
      const module = generateAdaptiveModule(
        section,
        2,
        isHard ? 'hard' : 'easy',
        new Set(Array.isArray(excludeIds) ? excludeIds : []),
        new Set(Array.isArray(seenIds) ? seenIds : []),
        difficultyMode,
        timerMode
      );
      return NextResponse.json({ success: true, tier: module.tier, isHard, module });
    }

    if (action === 'score') {
      const difficultyMode: SATExamDifficultyMode = body.difficultyMode || 'adaptive';
      return NextResponse.json({
        success: true,
        score: scoreExam(body.rwItems || [], body.mathItems || [], difficultyMode),
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Exam API error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  generateInitialFullSATExam,
  generateAdaptiveModule,
  calculateSATScore,
} from '@/lib/sat';

// GET: Generate fresh full exam
export async function GET() {
  const exam = generateInitialFullSATExam();
  return NextResponse.json({
    success: true,
    exam,
  });
}

// POST: Handles score calculation or dynamic adaptive routing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action 1: Route adaptive Module 2 based on Module 1 performance
    if (action === 'route_module') {
      const { section, m1CorrectCount, m1Total, excludeIds } = body;
      const ratio = Number(m1CorrectCount || 0) / Number(m1Total || (section === 'reading-writing' ? 27 : 22));
      // Official College Board threshold: ~65%+ correct routes to Hard Module 2
      const isHard = ratio >= 0.65;
      const tier = isHard ? 'hard' : 'easy';

      const adaptiveModule = generateAdaptiveModule(
        section,
        2,
        tier,
        new Set(Array.isArray(excludeIds) ? excludeIds : [])
      );

      return NextResponse.json({
        success: true,
        tier,
        isHard,
        module: adaptiveModule,
      });
    }

    // Action 2: Calculate final scaled score
    const { rwCorrect, totalRW, mathCorrect, totalMath, isRWHard, isMathHard } = body;

    const score = calculateSATScore(
      Number(rwCorrect) || 0,
      Number(totalRW) || 54,
      Number(mathCorrect) || 0,
      Number(totalMath) || 44,
      Boolean(isRWHard),
      Boolean(isMathHard)
    );

    return NextResponse.json({
      success: true,
      score,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Exam API error' },
      { status: 500 }
    );
  }
}

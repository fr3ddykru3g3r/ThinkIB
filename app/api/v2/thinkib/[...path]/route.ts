import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const origin = request.nextUrl.origin;
  // Redirect directly to the native InThinking Syllabus & Revision Database
  return NextResponse.redirect(`${origin}/thinkib`, 307);
}

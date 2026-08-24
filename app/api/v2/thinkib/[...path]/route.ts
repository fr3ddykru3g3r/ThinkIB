import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subpath = params.path ? params.path.join('/') : '';
  const targetUrl = `https://fr3ddykru3g3r.github.io/ThinkIB-Websites/${subpath}`;
  
  return NextResponse.redirect(targetUrl, 307);
}

import { NextRequest, NextResponse } from 'next/server';
const origins = new Set(['https://worlddebatecollective-prep.web.app','https://worlddebatecollective-prep.firebaseapp.com','https://prep.worlddebatecollective.org','https://learn.worlddebatecollective.org']);
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = request.method === 'OPTIONS' ? new NextResponse(null, { status: 204 }) : NextResponse.next();
  if (origin && origins.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Range');
    response.headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    response.headers.append('Vary', 'Origin');
  }
  return response;
}
export const config = { matcher: ['/api/:path*','/vault/:path*','/local-vault/:path*'] };

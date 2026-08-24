import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_PROJECT_ID = 'tdbgojlzvkulpzsglutv';
const SUPABASE_CDN_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/thinkib`;

function sanitizeKey(key: string) {
  return key.replace(/\\/g, '/');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const rawPath = params.path.map(decodeURIComponent).join('/');
  const filePath = sanitizeKey(rawPath);

  // If it's NOT an HTML file, redirect to the CDN directly
  if (!filePath.toLowerCase().endsWith('.html') && !filePath.toLowerCase().endsWith('.htm')) {
    const redirectUrl = `${SUPABASE_CDN_BASE}/${filePath}`;
    const response = NextResponse.redirect(redirectUrl, 307);
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  }

  const cdnUrl = `${SUPABASE_CDN_BASE}/${filePath}`;

  try {
    const cdnRes = await fetch(cdnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!cdnRes.ok) {
      console.error('Supabase HTML download status:', cdnRes.status, cdnRes.statusText);
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 3rem; background: #faf9f7; color: #2b2721; text-align: center; }
            .card { max-width: 520px; margin: 2rem auto; padding: 2rem; background: #fff; border: 1px solid rgba(43,39,33,0.12); border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
            h2 { color: #b84a39; margin-top: 0; }
            p { color: #666; line-height: 1.5; font-size: 0.95rem; }
            .btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #2b2721; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 0.85rem; }
            code { background: #f0ede6; padding: 2px 6px; border-radius: 3px; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Resource Not Found (404)</h2>
            <p>The requested file <code>${filePath}</code> was not found on the InThinking storage bucket.</p>
          </div>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    let html = await cdnRes.text();

    const pathSegments = filePath.split('/');
    const subjectRoot = pathSegments[0] || '';
    const cdnSubjectUrl = subjectRoot ? `${SUPABASE_CDN_BASE}/${subjectRoot}` : SUPABASE_CDN_BASE;

    // Rewrite relative asset folders to the subject-level root CDN
    const assetDirs = [
      'css', 'js', 'img', 'assets', 'images', 'uploads',
      'media', 'pdfs', 'powerpoints', 'ckeditor', 'mathlive@0.86.0',
      'tib-galleries', 'ajax', 'files'
    ];

    assetDirs.forEach(dir => {
      const regexDouble = new RegExp(`(href|src)="(${dir}/)`, 'g');
      const regexSingle = new RegExp(`(href|src)='(${dir}/)`, 'g');
      html = html.replace(regexDouble, `$1="${cdnSubjectUrl}/$2`);
      html = html.replace(regexSingle, `$1='${cdnSubjectUrl}/$2`);
    });

    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');

    return new NextResponse(html, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('ThinkIB HTML route fetch error:', err);
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; background: #faf9f7; color: #2b2721; text-align: center; }
          .card { max-width: 560px; margin: 2rem auto; padding: 2.5rem 2rem; background: #fff; border: 1px solid rgba(43,39,33,0.12); border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.05); }
          h2 { color: #b84a39; margin-top: 0; font-size: 1.4rem; }
          p { color: #555; line-height: 1.6; font-size: 0.95rem; text-align: left; }
          .highlight { background: #fdf6ec; border-left: 4px solid #e6a23c; padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 4px 4px 0; font-size: 0.88rem; color: #8a5a00; }
          .btn { display: inline-block; margin-top: 1.25rem; padding: 0.75rem 1.5rem; background: #3ecf8e; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s; }
          .btn:hover { background: #34b27b; }
          code { background: #f0ede6; padding: 2px 6px; border-radius: 3px; font-size: 0.82rem; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚡ Supabase Storage Project Paused</h2>
          <p>The InThinking storage backend project (<code>${SUPABASE_PROJECT_ID}</code>) is currently <strong>paused</strong> by Supabase due to inactivity.</p>
          <div class="highlight">
            <strong>How to restore in 10 seconds:</strong><br/>
            1. Open the Supabase project dashboard.<br/>
            2. Click the green <strong>"Restore" / "Resume project"</strong> button.<br/>
            3. Refresh this page and all InThinking syllabus guides will load instantly!
          </div>
          <a href="https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}" target="_blank" rel="noopener noreferrer" class="btn">
            Open Supabase Dashboard to Restore →
          </a>
        </div>
      </body>
      </html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

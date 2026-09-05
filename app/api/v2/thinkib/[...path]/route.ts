import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_BASE = 'https://fr3ddykru3g3r.github.io/ThinkIB-Websites';

let cachedSearchIndex: any[] | null = null;
function getSearchIndex(): any[] {
  if (!cachedSearchIndex) {
    try {
      const p = path.join(process.cwd(), 'public/thinkib/search_index.json');
      if (fs.existsSync(p)) {
        cachedSearchIndex = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch (e) {
      console.error('Error loading search index:', e);
    }
  }
  return cachedSearchIndex || [];
}

let cachedSearchScript: string | null = null;
function getSearchScript(): string {
  if (!cachedSearchScript) {
    try {
      const p = path.join(process.cwd(), 'public/thinkib/tib-search.js');
      if (fs.existsSync(p)) {
        cachedSearchScript = fs.readFileSync(p, 'utf-8');
      }
    } catch (e) {
      console.error('Error loading tib-search.js:', e);
    }
  }
  return cachedSearchScript || '';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderServerSearchPage(query: string, subpath: string): string {
  const index = getSearchIndex();
  const lowerQ = query.toLowerCase().trim();
  const terms = lowerQ.split(/\s+/).filter(t => t.length > 0);

  let currentSub = 'all';
  const pLower = subpath.toLowerCase();
  if (pLower.includes('mathanalysis')) currentSub = 'mathanalysis';
  else if (pLower.includes('englisha')) currentSub = 'englisha';
  else if (pLower.includes('chem')) currentSub = 'chem';
  else if (pLower.includes('history')) currentSub = 'history';
  else if (pLower.includes('psychology')) currentSub = 'psychology';
  else if (pLower.includes('biology')) currentSub = 'biology';
  else if (pLower.includes('economics')) currentSub = 'economics';
  else if (pLower.includes('business')) currentSub = 'business';

  const scored: { item: any; score: number }[] = [];
  if (terms.length > 0) {
    for (const item of index) {
      if (item.sub === 'englishb') continue;
      const tLow = (item.t || '').toLowerCase();
      const cLow = (item.c || '').toLowerCase();
      const sLow = (item.s || '').toLowerCase();
      const kLow = (item.k || '').toLowerCase();

      let score = 0;
      let allMatch = true;
      for (const term of terms) {
        let match = false;
        if (tLow.includes(term)) { score += 25; match = true; }
        if (cLow.includes(term)) { score += 12; match = true; }
        if (sLow.includes(term)) { score += 6; match = true; }
        if (kLow.includes(term)) { score += 4; match = true; }
        if (!match) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        if (item.sub === currentSub) score += 10;
        scored.push({ item, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
  }

  const matches = scored.map(s => s.item);

  let resultsHtml = '';
  if (!matches.length) {
    resultsHtml = `
      <div style="padding: 3rem 1.5rem; text-align: center; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; margin-top: 1.5rem;">
        <i class="fa fa-search fa-3x" style="color: #94a3b8; margin-bottom: 1rem;"></i>
        <h3 style="color: #334155; margin-bottom: 0.5rem;">No resources found for "${escapeHtml(query)}"</h3>
        <p style="color: #64748b; max-width: 480px; margin: 0 auto 1.5rem; font-size: 14px; line-height: 1.5;">
          Try searching for broader terms (e.g. "calculus", "bonding", "paper 1", "functions", "equilibrium") or browse syllabus topics via the navigation bar.
        </p>
        <button onclick="window.history.back()" class="btn btn-primary btn-sm" style="font-weight: 600;">
          <i class="fa fa-arrow-left" style="margin-right: 6px;"></i> Return to previous page
        </button>
      </div>
    `;
  } else {
    resultsHtml = '<div style="display: flex; flex-direction: column; gap: 14px; margin-top: 18px;">';
    for (const it of matches) {
      const href = `/api/v2/thinkib/${it.p}`;
      const tag = it.c || it.sub;
      resultsHtml += `
        <div class="tib-result-card" style="padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
            <a href="${href}" style="font-size: 16px; font-weight: 700; color: #0284c7; text-decoration: none; line-height: 1.4;">
              <i class="fa fa-file-text-o" style="margin-right: 8px; color: #3b82f6;"></i>
              ${escapeHtml(it.t)}
            </a>
            ${tag ? `<span style="font-size: 11px; font-weight: 600; background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; white-space: nowrap;">${escapeHtml(tag)}</span>` : ''}
          </div>
          ${it.s ? `<p style="margin: 6px 0 10px; color: #475569; font-size: 13.5px; line-height: 1.55;">${escapeHtml(it.s)}</p>` : ''}
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">${escapeHtml(it.p)}</div>
        </div>
      `;
    }
    resultsHtml += '</div>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Search Results: ${escapeHtml(query)} - ThinkIB</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="${GITHUB_BASE}/css/style.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <style>
    body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
    .layout-container { max-width: 1100px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
    .btn-back { background: #0284c7; color: #fff; padding: 8px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; }
    .btn-back:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="layout-container">
    <div class="header-bar">
      <div>
        <h1 style="margin: 0; font-size: 24px; color: #0f172a;">
          <i class="fa fa-search" style="color: #0284c7; margin-right: 10px;"></i>
          Search Results: <span style="color: #0284c7;">"${escapeHtml(query)}"</span>
        </h1>
        <p style="margin: 6px 0 0; color: #64748b; font-size: 14px;">Found <strong>${matches.length}</strong> matching resources</p>
      </div>
      <button onclick="window.history.back()" class="btn-back">
        <i class="fa fa-arrow-left"></i> Back to Previous Page
      </button>
    </div>
    ${resultsHtml}
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subpath = params.path ? params.path.join('/') : '';
  const isHtml = subpath.endsWith('.html') || !subpath.includes('.');
  const searchParam = request.nextUrl.searchParams.get('s');

  // Intercept search queries or paths containing /search
  if (subpath.endsWith('/search') || subpath === 'search' || subpath.includes('/search') || (searchParam && subpath.includes('search'))) {
    const query = searchParam || '';
    const searchPage = renderServerSearchPage(query, subpath);
    return new NextResponse(searchPage, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }

  // For non-HTML assets (images, css, pdf, js), redirect directly to GitHub Pages CDN
  if (!isHtml) {
    return NextResponse.redirect(`${GITHUB_BASE}/${subpath}`, 307);
  }

  // Fetch HTML directly from GitHub Pages
  try {
    const targetUrl = `${GITHUB_BASE}/${subpath}`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      if (searchParam) {
        const searchPage = renderServerSearchPage(searchParam, subpath);
        return new NextResponse(searchPage, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>ThinkIB Portal - Resource Guide</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 80vh; margin: 0; background: #fcfbfa; color: #1c1c1e; }
            .box { background: #fff; padding: 2.5rem; border-radius: 8px; border: 1px solid rgba(28,28,30,0.1); max-width: 480px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h2 { color: #b84a39; margin-top: 0; }
            p { color: #767679; font-size: 0.95rem; line-height: 1.5; }
            button { background: #b84a39; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Resource Notice</h2>
            <p>The requested route (<code>${escapeHtml(subpath)}</code>) was not found in the static mirror.</p>
            <p>Please use the <strong>InThinking Search Bar</strong> or the <strong>Topic Explorer</strong> to navigate available syllabus modules.</p>
            <button onclick="window.history.back()">Go Back</button>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    let html = await res.text();

    // Calculate directory path for <base href="...">
    const pathParts = subpath.split('/');
    pathParts.pop();
    const dirPath = pathParts.join('/');
    const baseHref = dirPath ? `${GITHUB_BASE}/${dirPath}/` : `${GITHUB_BASE}/`;

    // Load full client search script
    const searchScriptCode = getSearchScript();

    // Inject base href and the InThinking search engine script
    const injection = `
      <base href="${baseHref}">
      <script>
        ${searchScriptCode}
      </script>
    `;

    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${injection}`);
    } else {
      html = injection + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    return NextResponse.redirect(`${GITHUB_BASE}/${subpath}`, 307);
  }
}
